import os
import math
import requests
import re
from datetime import datetime
from collections import defaultdict
from urllib.parse import urlparse

OPENALEX_BASE = "https://api.openalex.org"
MAILTO = os.getenv("OPENALEX_MAILTO", "")
SESSION = requests.Session()
# Avoid inheriting broken shell-level proxy env vars.
SESSION.trust_env = False
AUTHOR_PROFILE_CACHE: dict[str, dict] = {}

def _get(url: str, params: dict | None = None) -> dict:
    params = params or {}
    if MAILTO:
        params["mailto"] = MAILTO

    r = SESSION.get(url, params=params, timeout=20)
    r.raise_for_status()
    return r.json()

def find_institution_id(name: str) -> str | None:
    data = _get(f"{OPENALEX_BASE}/institutions", params={"search": name, "per-page": 1})
    results = data.get("results", [])
    if not results:
        return None
    return results[0].get("id")


def _find_institution_record(name: str) -> dict:
    data = _get(f"{OPENALEX_BASE}/institutions", params={"search": name, "per-page": 1})
    results = data.get("results", [])
    if not results:
        return {}
    row = results[0] or {}
    return {
        "id": row.get("id"),
        "name": row.get("display_name") or name,
        "country": row.get("country_code") or "",
        "homepage_url": row.get("homepage_url") or "",
    }

def _reconstruct_abstract(inverted_index: dict | None) -> str:
    if not inverted_index:
        return ""
    positions = []
    for word, idxs in inverted_index.items():
        for i in idxs:
            positions.append((i, word))
    positions.sort(key=lambda x: x[0])
    return " ".join([w for _, w in positions])


def _get_author_profile(author_id: str) -> dict:
    cached = AUTHOR_PROFILE_CACHE.get(author_id)
    if cached is not None:
        return cached

    try:
        profile = _get(author_id)
    except Exception:
        profile = {}

    AUTHOR_PROFILE_CACHE[author_id] = profile
    return profile


def _is_likely_faculty(author_profile: dict, inst_id: str) -> bool:
    if not author_profile:
        # If profile lookup fails, keep candidate to avoid empty outputs.
        return True

    aff_ids = {
        (i.get("id") or "")
        for i in (author_profile.get("last_known_institutions") or [])
        if isinstance(i, dict)
    }
    # If OpenAlex has institution records for this author, enforce match.
    if aff_ids and inst_id not in aff_ids:
        return False

    works_count = int(author_profile.get("works_count") or 0)
    cited_by_count = int(author_profile.get("cited_by_count") or 0)
    h_index = int((author_profile.get("summary_stats") or {}).get("h_index") or 0)

    # Heuristic gate: tends to keep more established researchers and remove
    # student-level/early transient profiles.
    return (
        (cited_by_count >= 60)
        or (works_count >= 12 and h_index >= 5)
        or (h_index >= 8)
    )


def _normalize_location(value: str) -> str:
    return (value or "").strip().lower()


def _infer_research_type(title: str, abstract: str) -> str:
    text = f"{title or ''} {abstract or ''}".lower()
    if any(k in text for k in ["benchmark", "experiment", "dataset", "evaluation", "case study"]):
        return "empirical"
    if any(k in text for k in ["proof", "theorem", "formal", "axiom", "bound"]):
        return "theoretical"
    if any(k in text for k in ["application", "system", "deployment", "practical", "framework"]):
        return "applied"
    if any(k in text for k in ["cross-disciplinary", "interdisciplinary", "multi-domain"]):
        return "interdisciplinary"
    return "general"


def _extract_contact_email(author_profile: dict) -> str:
    profile_email = (author_profile.get("email") or "").strip()
    if profile_email:
        return profile_email
    return ""


def _extract_domain(url: str) -> str:
    if not url:
        return ""
    try:
        host = (urlparse(url).netloc or "").lower().strip()
    except Exception:
        return ""
    if host.startswith("www."):
        host = host[4:]
    return host


def _parse_name_parts(display_name: str) -> tuple[str, str]:
    tokens = re.findall(r"[A-Za-z]+", display_name or "")
    if len(tokens) < 2:
        return "", ""
    first = tokens[0].lower()
    last = tokens[-1].lower()
    return first, last


def _infer_contact_email(display_name: str, domain: str) -> str:
    first, last = _parse_name_parts(display_name)
    if not first or not last or not domain:
        return ""
    return f"{first}.{last}@{domain}"


def _resolve_contact_email(author_profile: dict, display_name: str, institution_domain: str) -> tuple[str, str, str]:
    direct_email = _extract_contact_email(author_profile)
    if direct_email:
        return direct_email, "openalex", "high"
    inferred = _infer_contact_email(display_name, institution_domain)
    if inferred:
        return inferred, "inferred", "low"
    return "", "unavailable", "none"


def _passes_filters(meta: dict, filters: dict | None = None) -> bool:
    filters = filters or {}
    recency_years = int(filters.get("recency_years") or 0)
    research_type = (filters.get("research_type") or "").strip().lower()
    location = _normalize_location(filters.get("location") or "")

    if recency_years > 0:
        threshold = datetime.utcnow().year - recency_years
        if int(meta.get("top_work_year") or 0) < threshold:
            return False

    if research_type:
        if (meta.get("research_type") or "").strip().lower() != research_type:
            return False

    if location:
        location_tokens = {
            _normalize_location(meta.get("country")),
            _normalize_location(meta.get("location")),
        }
        if location not in location_tokens:
            return False

    return True

def discover_authors_for_institution(
    inst_id: str,
    query: str,
    per_page: int = 25,
    *,
    inst_record: dict | None = None,
    filters: dict | None = None,
) -> list[dict]:
    works = _get(
        f"{OPENALEX_BASE}/works",
        params={
            "search": query,
            "filter": f"institutions.id:{inst_id}",
            "sort": "cited_by_count:desc",
            "per-page": per_page,
        },
    ).get("results", [])

    author_score = defaultdict(float)
    author_meta = {}

    for w in works:
        cited = w.get("cited_by_count", 0) or 0
        title = w.get("title") or ""
        abstract = _reconstruct_abstract(w.get("abstract_inverted_index"))
        year = w.get("publication_year")

        for a in w.get("authorships", []):
            # Only keep authors explicitly affiliated with the target institution
            # on this work (reduces non-target co-authors/students from elsewhere).
            auth_inst_ids = {
                (inst.get("id") or "")
                for inst in (a.get("institutions") or [])
                if isinstance(inst, dict)
            }
            if inst_id not in auth_inst_ids:
                continue

            author = a.get("author") or {}
            aid = author.get("id")
            name = author.get("display_name")
            if not aid or not name:
                continue

            profile = _get_author_profile(aid)
            if not _is_likely_faculty(profile, inst_id):
                continue
            research_type = _infer_research_type(title, abstract)
            institution_country = (inst_record or {}).get("country") or ""
            location = institution_country or ""
            institution_domain = _extract_domain((inst_record or {}).get("homepage_url") or "")
            contact_email, email_source, email_confidence = _resolve_contact_email(
                profile, name, institution_domain
            )

            score = 1.0 + math.log1p(cited)
            author_score[aid] += score

            if aid not in author_meta:
                author_meta[aid] = {
                    "id": aid,
                    "name": name,
                    "top_work_title": title,
                    "top_work_year": year,
                    "top_work_citations": cited,
                    "top_work_abstract": abstract[:500],
                    "research_type": research_type,
                    "country": institution_country,
                    "location": location,
                    "contact_email": contact_email,
                    "contact_email_source": email_source,
                    "contact_email_confidence": email_confidence,
                }
            else:
                if cited > (author_meta[aid].get("top_work_citations") or 0):
                    author_meta[aid].update({
                        "top_work_title": title,
                        "top_work_year": year,
                        "top_work_citations": cited,
                        "top_work_abstract": abstract[:500],
                        "research_type": research_type,
                    })
                if not author_meta[aid].get("contact_email") and contact_email:
                    author_meta[aid]["contact_email"] = contact_email
                    author_meta[aid]["contact_email_source"] = email_source
                    author_meta[aid]["contact_email_confidence"] = email_confidence

    candidates = []
    for aid, score in sorted(author_score.items(), key=lambda x: x[1], reverse=True):
        meta = author_meta.get(aid, {})
        if not _passes_filters(meta, filters):
            continue
        meta["score"] = score
        candidates.append(meta)

    return candidates

# ---------------------------------------------------
# DEV MODE (without Stellanet ranking)
# ---------------------------------------------------

def build_results(
    interest: str,
    profile: str,
    universities: list[str],
    top_k: int = 8,
    filters: dict | None = None,
) -> list[dict]:
    all_candidates = []
    inst_map = {}

    for uni in universities:
        inst = _find_institution_record(uni)
        inst_id = inst.get("id")
        if inst_id:
            inst_map[uni] = inst

    for uni, inst in inst_map.items():
        cands = discover_authors_for_institution(
            inst.get("id"),
            interest,
            inst_record=inst,
            filters=filters,
        )
        for c in cands[:top_k]:
            c["university"] = uni
            all_candidates.append(c)

    merged = {}
    for c in all_candidates:
        aid = c["id"]
        if aid not in merged:
            merged[aid] = c
        else:
            merged[aid]["score"] += c.get("score", 0)

    final = sorted(merged.values(), key=lambda x: x.get("score", 0), reverse=True)[:top_k]

    results = []

    for i, c in enumerate(final, start=1):
        score = c.get("score", 0)
        fit = max(60, min(95, int(60 + score * 6)))

        title = "Researcher"

        why = (
            f"Top paper: “{(c.get('top_work_title') or 'N/A')[:80]}” "
            f"({c.get('top_work_citations', 0)} citations)."
        )

        subject = f"Prospective undergraduate researcher — {interest[:55]}"

        body = (
            f"Dear Professor {c.get('name','')},\n\n"
            f"I’m interested in {interest}.\n\n"
            f"{profile}\n\n"
            f"I found your work (e.g., “{(c.get('top_work_title') or '')[:80]}”) aligned with my interests.\n\n"
            f"Best regards,\nBimal"
        )

        results.append({
            "id": f"oa{i}",
            "name": c.get("name", "Unknown"),
            "title": title,
            "university": c.get("university", "Unknown University"),
            "location": c.get("location", ""),
            "research_type": c.get("research_type", ""),
            "contact_email": c.get("contact_email", ""),
            "contact_email_source": c.get("contact_email_source", "unavailable"),
            "contact_email_confidence": c.get("contact_email_confidence", "none"),
            "fit": fit,
            "why": why,
            "why_bullets": [
                f"Top paper impact includes {c.get('top_work_citations', 0)} citations.",
                f"Recent work aligns with your interest in {interest[:50]}.",
            ],
            "match_breakdown": {
                "topic": max(55, min(95, fit - 3)),
                "profile": max(50, min(95, fit - 5)),
                "recency": 80 if (c.get("top_work_year") or 0) >= datetime.utcnow().year - 3 else 65,
            },
            "recent_papers": [
                {
                    "title": c.get("top_work_title", ""),
                    "year": c.get("top_work_year"),
                }
            ],
            "subject": subject,
            "body": body,
        })

    return results

# ---------------------------------------------------
# STELLANET MODE (grounded candidates only)
# ---------------------------------------------------

def build_stellanet_candidates(
    interest: str,
    universities: list[str],
    top_k: int = 12,
    filters: dict | None = None,
) -> list[dict]:
    all_candidates = []
    inst_map = {}

    for uni in universities:
        inst = _find_institution_record(uni)
        inst_id = inst.get("id")
        if inst_id:
            inst_map[uni] = inst

    for uni, inst in inst_map.items():
        cands = discover_authors_for_institution(
            inst.get("id"),
            interest,
            inst_record=inst,
            filters=filters,
        )
        for c in cands[:top_k]:
            all_candidates.append({
                "author_id": c.get("id"),
                "name": c.get("name"),
                "university": uni,
                "location": c.get("location", ""),
                "country": c.get("country", ""),
                "research_type": c.get("research_type", ""),
                "contact_email": c.get("contact_email", ""),
                "contact_email_source": c.get("contact_email_source", "unavailable"),
                "contact_email_confidence": c.get("contact_email_confidence", "none"),
                "top_work_title": c.get("top_work_title"),
                "top_work_year": c.get("top_work_year"),
                "top_work_citations": c.get("top_work_citations"),
                "top_work_abstract": c.get("top_work_abstract"),
            })

    seen = set()
    dedup = []
    for c in all_candidates:
        aid = c.get("author_id")
        if not aid or aid in seen:
            continue
        seen.add(aid)
        dedup.append(c)

    return dedup[:top_k]


def enrich_results_with_candidate_data(
    *,
    results: list[dict],
    candidates: list[dict],
    interest: str,
    filters: dict | None = None,
) -> list[dict]:
    filters = filters or {}
    candidate_by_id = {}
    for row in candidates or []:
        cid = (row.get("author_id") or row.get("id") or "").strip()
        if cid:
            candidate_by_id[cid] = row

    enriched = []
    for row in results or []:
        item = dict(row)
        candidate = candidate_by_id.get(str(item.get("id") or ""))
        if candidate:
            top_title = candidate.get("top_work_title") or ""
            top_year = candidate.get("top_work_year")
            item.setdefault("location", candidate.get("location", ""))
            item.setdefault("research_type", candidate.get("research_type", ""))
            item.setdefault("contact_email", candidate.get("contact_email", ""))
            item.setdefault("contact_email_source", candidate.get("contact_email_source", "unavailable"))
            item.setdefault(
                "contact_email_confidence",
                candidate.get("contact_email_confidence", "none"),
            )
            item.setdefault(
                "recent_papers",
                [{"title": top_title, "year": top_year}] if top_title else [],
            )
            item.setdefault(
                "why_bullets",
                [
                    f"Topic overlap: {interest[:80]}",
                    f"Recent publication: {top_title[:90] or 'research evidence from OpenAlex'}",
                ],
            )

        fit = int(item.get("fit") or 70)
        recent_year = 0
        if item.get("recent_papers"):
            first_paper = item["recent_papers"][0] or {}
            recent_year = int(first_paper.get("year") or 0)
        recency_years = int(filters.get("recency_years") or 3)
        recency_score = 85 if recent_year >= datetime.utcnow().year - recency_years else 65
        item.setdefault(
            "match_breakdown",
            {
                "topic": max(50, min(95, fit - 2)),
                "profile": max(50, min(95, fit - 5)),
                "recency": recency_score,
            },
        )
        item.setdefault("contact_email", "")
        item.setdefault("contact_email_source", "unavailable")
        item.setdefault("contact_email_confidence", "none")
        enriched.append(item)
    return enriched
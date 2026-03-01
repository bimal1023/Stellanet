import os
import json
import re
import boto3
from botocore.config import Config

AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
NOVA_MODEL_ID = os.getenv("NOVA_TEXT_MODEL_ID", "global.amazon.nova-2-lite-v1:0")

# Avoid inheriting broken shell-level proxy env vars.
brt = boto3.client("bedrock-runtime", region_name=AWS_REGION, config=Config(proxies={}))


def _strip_markdown_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z0-9_-]*\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _extract_json_object(text: str) -> dict:
    cleaned = _strip_markdown_fences(text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: model sometimes adds extra text around the JSON object.
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise


def _normalize_result(item: dict, fallback_id: str) -> dict:
    return {
        "id": str(item.get("id") or fallback_id),
        "name": item.get("name") or "Unknown Researcher",
        "title": item.get("title") or "Researcher",
        "university": item.get("university") or "Unknown University",
        "fit": int(item.get("fit", 75)),
        "why": item.get("why") or "Potentially relevant research match.",
        "subject": item.get("subject") or "Prospective undergraduate researcher",
        "body": item.get("body") or "Dear Professor,\n\nI am interested in your research.\n\nBest regards,",
    }

def stellanet_rank_and_draft(interest: str, profile: str, candidates: list[dict], top_k: int = 8) -> list[dict]:
    """
    candidates: list of dicts (REAL, from OpenAlex) like:
      {
        "author_id": "...",
        "name": "...",
        "university": "...",
        "top_work_title": "...",
        "top_work_year": 2023,
        "top_work_citations": 120,
        "top_work_abstract": "..."
      }

    Returns list of results matching your frontend schema.
    """
    system_text = (
        "You are Stellanet, a careful academic outreach assistant.\n"
        "Hard rules:\n"
        "- Do NOT invent people, affiliations, publications, or claims.\n"
        "- Use ONLY the provided candidates and their evidence.\n"
        "- Return STRICT JSON only. No markdown, no commentary.\n"
        "- Output must be an object with key 'results' containing a list.\n"
    )

    # Keep the prompt compact; the model can reason, but we want stable JSON.
    user_payload = {
        "interest": interest,
        "profile": profile,
        "top_k": top_k,
        "candidates": candidates,
        "output_format": {
            "results": [
                {
                    "id": "string (use candidate author_id or a stable id)",
                    "name": "string",
                    "title": "string (short research tags based on evidence)",
                    "university": "string",
                    "fit": "integer 0-100",
                    "why": "string (1-2 sentences grounded in evidence)",
                    "subject": "string",
                    "body": "string (email with \\n newlines)"
                }
            ]
        }
    }

    user_text = (
        "Task: Rank the best candidates for the user's interest and draft outreach emails.\n"
        "Return JSON only matching output_format.\n\n"
        + json.dumps(user_payload)
    )

    resp = brt.converse(
        modelId=NOVA_MODEL_ID,
        system=[{"text": system_text}],
        messages=[{"role": "user", "content": [{"text": user_text}]}],
        # Optional: helps consistency
        inferenceConfig={"temperature": 0.4, "maxTokens": 1600},
    )

    # Extract model text
    blocks = resp["output"]["message"]["content"]
    text_out = ""
    for b in blocks:
        if "text" in b:
            text_out += b["text"]

    # Parse JSON robustly (the model can return markdown-fenced JSON).
    data = _extract_json_object(text_out)
    raw_results = data.get("results", [])
    if not isinstance(raw_results, list):
        return []

    normalized = []
    for idx, item in enumerate(raw_results[:top_k], start=1):
        if isinstance(item, dict):
            normalized.append(_normalize_result(item, fallback_id=f"stellanet-{idx}"))

    return normalized


def stellanet_rewrite_draft(
    *,
    tone: str,
    professor_name: str,
    university: str,
    base_subject: str,
    base_body: str,
    context: dict | None = None,
) -> dict:
    """
    Rewrite a single outreach draft in a requested tone using Stellanet.
    Returns: {"subject": str, "body": str}
    """
    tone_key = (tone or "Professional").strip().title()
    tone_rules = {
        "Professional": "Formal, polished, specific, and concise. 170-230 words.",
        "Friendly": "Warm and personable while still respectful and credible. 140-200 words.",
        "Short": "Very concise and high-signal. 90-130 words.",
    }
    if tone_key not in tone_rules:
        tone_key = "Professional"

    system_text = (
        "You are a senior academic writing assistant for student outreach emails.\n"
        "Hard rules:\n"
        "- Keep factual details grounded in the provided draft/context.\n"
        "- Do not invent achievements, publications, or affiliations.\n"
        "- Preserve concrete specifics from the original draft when possible.\n"
        "- Return STRICT JSON only with keys: subject, body.\n"
        "- body must be plain text email with newline separators."
    )

    user_payload = {
        "task": "rewrite_outreach_email",
        "tone": tone_key,
        "tone_guidance": tone_rules[tone_key],
        "professor_name": professor_name,
        "university": university,
        "original_subject": base_subject,
        "original_body": base_body,
        "additional_context": context or {},
        "output_format": {
            "subject": "string",
            "body": "string",
        },
    }

    user_text = (
        "Rewrite the outreach draft with higher quality and specificity while matching the requested tone. "
        "Keep the message authentic for an undergraduate student.\n\n"
        + json.dumps(user_payload)
    )

    resp = brt.converse(
        modelId=NOVA_MODEL_ID,
        system=[{"text": system_text}],
        messages=[{"role": "user", "content": [{"text": user_text}]}],
        inferenceConfig={"temperature": 0.55, "maxTokens": 1200},
    )

    blocks = resp["output"]["message"]["content"]
    text_out = ""
    for b in blocks:
        if "text" in b:
            text_out += b["text"]

    data = _extract_json_object(text_out)
    subject = str(data.get("subject") or base_subject).strip()
    body = str(data.get("body") or base_body).strip()

    if not body:
        raise RuntimeError("Stellanet rewrite returned empty body")

    return {"subject": subject, "body": body.replace("\r\n", "\n")}
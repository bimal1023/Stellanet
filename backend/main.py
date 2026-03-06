import os
import logging
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

from openalex_client import build_stellanet_candidates, build_results, enrich_results_with_candidate_data
from nova_ranker import stellanet_rank_and_draft, stellanet_rewrite_draft
from auth_store import (
    init_auth_db,
    create_user,
    authenticate_user,
    create_session,
    create_or_get_oauth_user,
    get_user_by_token,
    delete_session,
    verify_email,
    issue_password_reset,
    reset_password,
)
from oauth_verifier import verify_oauth_id_token
from mailer import (
    email_enabled,
    send_verification_email,
    send_password_reset_email,
    send_contact_message,
)

app = FastAPI()
init_auth_db()
logger = logging.getLogger("stellanet.auth")
# Safer default for production; enable only when explicitly needed.
AUTH_EXPOSE_TOKENS = os.getenv("AUTH_EXPOSE_TOKENS", "false").strip().lower() == "true"
default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]


def _parse_frontend_origins() -> list[str]:
    raw_values = [
        os.getenv("FRONTEND_URL", ""),
        os.getenv("FRONTEND_URLS", ""),
    ]
    expanded = []
    for raw in raw_values:
        parts = [p.strip().rstrip("/") for p in (raw or "").split(",")]
        expanded.extend([p for p in parts if p])
    # Keep order stable while removing duplicates.
    return list(dict.fromkeys(expanded))


allow_origins = [*default_origins, *_parse_frontend_origins()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    # Frontend dev port may auto-shift (e.g. 5174, 5175) when occupied.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiscoverRequest(BaseModel):
    interest: str
    profile: str
    universities: List[str]
    filters: dict = {}


class RewriteDraftRequest(BaseModel):
    tone: str
    professor_name: str
    university: str
    subject: str
    body: str
    why: str = ""
    title: str = ""
    rewrite_attempt: int = 0


class SignUpRequest(BaseModel):
    full_name: str
    email: str
    password: str
    remember_me: bool = False


class SignInRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class OAuthSignInRequest(BaseModel):
    provider: str
    id_token: str
    remember_me: bool = True


class VerifyEmailRequest(BaseModel):
    email: str
    verification_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


class ContactRequest(BaseModel):
    first_name: str = ""
    last_name: str = ""
    email: str
    message: str


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        return ""
    prefix = "bearer "
    raw = authorization.strip()
    if raw.lower().startswith(prefix):
        return raw[len(prefix):].strip()
    return ""

@app.get("/")
def root():
    return {"message": "Stellanet backend running"}


@app.post("/auth/signup")
def auth_signup(req: SignUpRequest):
    try:
        user, verification_token = create_user(req.full_name, req.email, req.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    response = {
        "user": user,
        "requires_verification": True,
        "message": "Account created. Verify your email to continue.",
    }
    if email_enabled():
        try:
            send_verification_email(
                to_email=user["email"],
                full_name=user["full_name"],
                verification_token=verification_token,
            )
            response["email_sent"] = True
        except Exception as exc:
            logger.exception("Verification email send failed for %s", user["email"])
            response["email_sent"] = False
            response["message"] = (
                "Account created, but email could not be delivered. Use verification token."
            )
            if AUTH_EXPOSE_TOKENS:
                response["verification_token"] = verification_token
                response["email_error"] = str(exc)
    elif AUTH_EXPOSE_TOKENS:
        response["verification_token"] = verification_token

    return response


@app.post("/auth/signin")
def auth_signin(req: SignInRequest):
    user, auth_error = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if auth_error == "email_not_verified":
        raise HTTPException(status_code=403, detail="Email not verified")
    session_days = 30 if req.remember_me else 7
    token = create_session(user["id"], days_valid=session_days)
    return {"token": token, "user": user}


@app.post("/auth/oauth-signin")
def auth_oauth_signin(req: OAuthSignInRequest):
    try:
        identity = verify_oauth_id_token(req.provider, req.id_token)
        user = create_or_get_oauth_user(identity["full_name"], identity["email"])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        logger.exception("OAuth sign-in failed for provider=%s", req.provider)
        raise HTTPException(status_code=500, detail="OAuth sign-in failed")

    session_days = 30 if req.remember_me else 7
    token = create_session(user["id"], days_valid=session_days)
    return {"token": token, "user": user}


@app.post("/auth/verify-email")
def auth_verify_email(req: VerifyEmailRequest):
    try:
        user = verify_email(req.email, req.verification_token)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True, "user": user}


@app.get("/auth/me")
def auth_me(authorization: str | None = Header(default=None)):
    token = _extract_bearer_token(authorization)
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"user": user}


@app.post("/auth/signout")
def auth_signout(authorization: str | None = Header(default=None)):
    token = _extract_bearer_token(authorization)
    if token:
        delete_session(token)
    return {"ok": True}


@app.post("/auth/forgot-password")
def auth_forgot_password(req: ForgotPasswordRequest):
    token = issue_password_reset(req.email)
    response = {"ok": True, "message": "If the account exists, reset instructions were sent."}

    if token and email_enabled():
        try:
            send_password_reset_email(to_email=req.email, reset_token=token)
            response["email_sent"] = True
        except Exception as exc:
            logger.exception("Password reset email send failed for %s", req.email)
            response["email_sent"] = False
            response["message"] = "Reset requested, but email could not be delivered."
            if AUTH_EXPOSE_TOKENS:
                response["reset_token"] = token
                response["email_error"] = str(exc)
    elif token and AUTH_EXPOSE_TOKENS:
        response["reset_token"] = token

    return response


@app.post("/auth/reset-password")
def auth_reset_password(req: ResetPasswordRequest):
    try:
        user = reset_password(req.reset_token, req.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True, "user": user}

@app.post("/discover")
def discover(req: DiscoverRequest):
    candidates = []
    results = []
    filters = req.filters or {}

    # 1) Retrieve REAL candidates (grounding from OpenAlex)
    try:
        candidates = build_stellanet_candidates(
            req.interest,
            req.universities,
            top_k=12,
            filters=filters,
        )
    except Exception:
        logger.exception("OpenAlex candidate retrieval failed")
        candidates = []

    # 2) Stellanet ranks + drafts (grounded)
    if candidates:
        try:
            results = stellanet_rank_and_draft(
                interest=req.interest,
                profile=req.profile,
                candidates=candidates,
                top_k=8
            )
        except Exception:
            logger.exception("Nova ranking/drafting failed; will try OpenAlex fallback build_results")
            results = []

    # 3) Safe fallback for smoother UX (never return 500 for discover failures)
    if not results:
        try:
            results = build_results(
                interest=req.interest,
                profile=req.profile,
                universities=req.universities,
                top_k=8,
                filters=filters,
            )
        except Exception:
            logger.exception("OpenAlex fallback build_results failed")
            results = []

    if not results:
        results = [{
            "id": "fallback-1",
            "name": "Research Lead",
            "title": "Faculty Researcher",
            "university": req.universities[0] if req.universities else "Target University",
            "fit": 70,
            "why": "Temporary fallback result generated due to upstream service issues.",
            "contact_email": "",
            "contact_email_source": "unavailable",
            "contact_email_confidence": "none",
            "subject": f"Prospective undergraduate researcher — {req.interest[:55]}",
            "body": (
                "Dear Professor,\n\n"
                f"I am very interested in {req.interest} and your recent research direction.\n\n"
                f"{req.profile}\n\n"
                "If possible, I would appreciate an opportunity to learn about potential "
                "undergraduate research opportunities.\n\n"
                "Best regards,\nBimal"
            ),
        }]

    try:
        enriched = enrich_results_with_candidate_data(
            results=results,
            candidates=candidates,
            interest=req.interest,
            filters=filters,
        )
    except Exception:
        logger.exception("Result enrichment failed; returning non-enriched results")
        enriched = results
    return {"results": enriched}


@app.post("/rewrite-draft")
def rewrite_draft(req: RewriteDraftRequest):
    try:
        rewritten = stellanet_rewrite_draft(
            tone=req.tone,
            professor_name=req.professor_name,
            university=req.university,
            base_subject=req.subject,
            base_body=req.body,
            context={
                "why_match": req.why,
                "research_title_or_tags": req.title,
                "rewrite_attempt": req.rewrite_attempt,
            },
        )
        return rewritten
    except Exception:
        # Safe fallback: return original draft instead of 500.
        return {"subject": req.subject, "body": req.body}


@app.post("/contact")
def contact(req: ContactRequest):
    email = (req.email or "").strip()
    message = (req.message or "").strip()
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    if len(message) < 3:
        raise HTTPException(status_code=400, detail="Message is too short")

    try:
        send_contact_message(
            first_name=req.first_name or "",
            last_name=req.last_name or "",
            from_email=email,
            message=message,
        )
        return {"ok": True, "message": "Thanks for reaching out. We will get back to you soon."}
    except Exception:
        logger.exception("Contact form email delivery failed for %s", email)
        raise HTTPException(status_code=500, detail="Could not deliver message right now")
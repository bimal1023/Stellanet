import os
from functools import lru_cache

import requests


GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


def _split_csv_env(name: str) -> list[str]:
    raw = os.getenv(name, "")
    return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache(maxsize=1)
def _google_client_ids() -> list[str]:
    return _split_csv_env("GOOGLE_OAUTH_CLIENT_IDS")


def _require_email(email: str) -> str:
    email_n = (email or "").strip().lower()
    if "@" not in email_n:
        raise ValueError("OAuth provider did not return a valid email")
    return email_n


def verify_google_id_token(id_token: str) -> dict:
    client_ids = _google_client_ids()
    if not client_ids:
        raise ValueError("Google OAuth is not configured")

    resp = requests.get(GOOGLE_TOKENINFO_URL, params={"id_token": id_token}, timeout=15)
    if not resp.ok:
        raise ValueError("Invalid Google token")
    payload = resp.json() or {}

    aud = (payload.get("aud") or "").strip()
    if aud not in client_ids:
        raise ValueError("Google token audience mismatch")
    if (payload.get("email_verified") or "").lower() != "true":
        raise ValueError("Google account email is not verified")

    email = _require_email(payload.get("email") or "")
    full_name = (payload.get("name") or "").strip() or email.split("@")[0]
    subject = (payload.get("sub") or "").strip()
    if not subject:
        raise ValueError("Google token missing subject")
    return {"email": email, "full_name": full_name, "subject": subject}


def verify_oauth_id_token(provider: str, id_token: str) -> dict:
    provider_n = (provider or "").strip().lower()
    token = (id_token or "").strip()
    if not token:
        raise ValueError("OAuth token is required")
    if provider_n == "google":
        return verify_google_id_token(token)
    raise ValueError("Unsupported OAuth provider (Google only)")

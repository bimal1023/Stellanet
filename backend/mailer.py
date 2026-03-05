import os
import smtplib
from email.message import EmailMessage
from urllib.parse import quote_plus
import requests


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USERNAME).strip()
SMTP_USE_TLS = _env_bool("SMTP_USE_TLS", True)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
FRONTEND_URLS = os.getenv("FRONTEND_URLS", "").strip()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
RESEND_FROM = os.getenv("RESEND_FROM", SMTP_FROM).strip()
CONTACT_TO_EMAIL = os.getenv("CONTACT_TO_EMAIL", "").strip()
RESEND_API_BASE = "https://api.resend.com/emails"


def email_enabled() -> bool:
    resend_ready = bool(RESEND_API_KEY and RESEND_FROM)
    smtp_ready = bool(SMTP_HOST and SMTP_FROM and SMTP_USERNAME and SMTP_PASSWORD)
    return resend_ready or smtp_ready


def _send_email(*, to_email: str, subject: str, text_body: str) -> None:
    if RESEND_API_KEY and RESEND_FROM:
        _send_email_via_resend(to_email=to_email, subject=subject, text_body=text_body)
        return

    _send_email_via_smtp(to_email=to_email, subject=subject, text_body=text_body)


def _send_email_via_smtp(*, to_email: str, subject: str, text_body: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(text_body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        if SMTP_USE_TLS:
            server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)


def _send_email_via_resend(*, to_email: str, subject: str, text_body: str) -> None:
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "text": text_body,
    }
    # Ignore shell/system proxy env vars; they can break Resend in local dev.
    with requests.Session() as session:
        session.trust_env = False
        response = session.post(RESEND_API_BASE, headers=headers, json=payload, timeout=20)
    response.raise_for_status()


def _public_frontend_base() -> str:
    candidates = [FRONTEND_URL]
    if FRONTEND_URLS:
        candidates.extend([part.strip().rstrip("/") for part in FRONTEND_URLS.split(",") if part.strip()])

    for url in candidates:
        if not url:
            continue
        # Never send localhost links to real users.
        if "localhost" in url or "127.0.0.1" in url:
            continue
        return url
    return ""


def send_verification_email(*, to_email: str, full_name: str, verification_token: str) -> None:
    frontend_base = _public_frontend_base()
    url = ""
    if frontend_base:
        url = (
            f"{frontend_base}/?auth=verify"
            f"&email={quote_plus(to_email)}"
            f"&token={quote_plus(verification_token)}"
        )

    if url:
        text = (
            f"Hi {full_name},\n\n"
            "Welcome! Please verify your email to activate your account.\n\n"
            f"Verification link:\n{url}\n\n"
            "If the link does not open automatically, copy your verification token:\n"
            f"{verification_token}\n\n"
            "This message was sent by your Stellanet authentication service."
        )
    else:
        text = (
            f"Hi {full_name},\n\n"
            "Welcome! Please verify your email to activate your account.\n\n"
            "Copy your verification token into the Verify Email screen:\n"
            f"{verification_token}\n\n"
            "This message was sent by your Stellanet authentication service."
        )

    _send_email(
        to_email=to_email,
        subject="Verify your account",
        text_body=text,
    )


def send_password_reset_email(*, to_email: str, reset_token: str) -> None:
    frontend_base = _public_frontend_base()
    url = ""
    if frontend_base:
        url = (
            f"{frontend_base}/?auth=reset"
            f"&email={quote_plus(to_email)}"
            f"&token={quote_plus(reset_token)}"
        )

    if url:
        text = (
            "We received a request to reset your password.\n\n"
            f"Reset link:\n{url}\n\n"
            "If the link does not open automatically, copy this reset token:\n"
            f"{reset_token}\n\n"
            "This token expires in 30 minutes. If you did not request this, ignore this email."
        )
    else:
        text = (
            "We received a request to reset your password.\n\n"
            "Copy this reset token into the Reset Password screen:\n"
            f"{reset_token}\n\n"
            "This token expires in 30 minutes. If you did not request this, ignore this email."
        )

    _send_email(
        to_email=to_email,
        subject="Reset your password",
        text_body=text,
    )


def send_contact_message(*, first_name: str, last_name: str, from_email: str, message: str) -> None:
    """Send contact form submission to configured inbox."""
    to_email = CONTACT_TO_EMAIL or RESEND_FROM or SMTP_FROM
    if not to_email:
        raise ValueError("CONTACT_TO_EMAIL is not configured")

    sender_name = " ".join([first_name.strip(), last_name.strip()]).strip() or "Website visitor"
    subject = f"New Stellanet contact form message from {sender_name}"
    body = (
        "You received a new contact message from Stellanet website.\n\n"
        f"Name: {sender_name}\n"
        f"Email: {from_email.strip()}\n\n"
        "Message:\n"
        f"{message.strip()}\n"
    )
    _send_email(to_email=to_email, subject=subject, text_body=body)

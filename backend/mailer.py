import os
import smtplib
from email.message import EmailMessage
from urllib.parse import quote_plus


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


def email_enabled() -> bool:
    return bool(SMTP_HOST and SMTP_FROM and SMTP_USERNAME and SMTP_PASSWORD)


def _send_email(*, to_email: str, subject: str, text_body: str) -> None:
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


def send_verification_email(*, to_email: str, full_name: str, verification_token: str) -> None:
    url = (
        f"{FRONTEND_URL}/?auth=verify"
        f"&email={quote_plus(to_email)}"
        f"&token={quote_plus(verification_token)}"
    )
    text = (
        f"Hi {full_name},\n\n"
        "Welcome! Please verify your email to activate your account.\n\n"
        f"Verification link:\n{url}\n\n"
        "If the link does not open automatically, copy your verification token:\n"
        f"{verification_token}\n\n"
        "This message was sent by your Stellanet authentication service."
    )
    _send_email(
        to_email=to_email,
        subject="Verify your account",
        text_body=text,
    )


def send_password_reset_email(*, to_email: str, reset_token: str) -> None:
    url = (
        f"{FRONTEND_URL}/?auth=reset"
        f"&email={quote_plus(to_email)}"
        f"&token={quote_plus(reset_token)}"
    )
    text = (
        "We received a request to reset your password.\n\n"
        f"Reset link:\n{url}\n\n"
        "If the link does not open automatically, copy this reset token:\n"
        f"{reset_token}\n\n"
        "This token expires in 30 minutes. If you did not request this, ignore this email."
    )
    _send_email(
        to_email=to_email,
        subject="Reset your password",
        text_body=text,
    )

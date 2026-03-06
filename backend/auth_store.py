import base64
import hashlib
import os
import secrets
import sqlite3
import threading
from datetime import datetime, timedelta, timezone

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except Exception:  # pragma: no cover - optional dependency for local sqlite mode
    psycopg2 = None
    RealDictCursor = None

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DB_PATH = os.getenv("AUTH_DB_PATH", os.path.join(os.path.dirname(__file__), "auth.db"))
IS_POSTGRES = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
_LOCK = threading.Lock()


def _conn():
    if IS_POSTGRES:
        if psycopg2 is None:
            raise RuntimeError("psycopg2 is required when DATABASE_URL is set")
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def _adapt_sql(sql: str) -> str:
    if not IS_POSTGRES:
        return sql
    return sql.replace("?", "%s")


def _execute(conn, sql: str, params: tuple = ()):
    cur = conn.cursor()
    cur.execute(_adapt_sql(sql), params)
    return cur


def _fetchone(conn, sql: str, params: tuple = ()) -> dict | None:
    cur = _execute(conn, sql, params)
    row = cur.fetchone()
    if row is None:
        return None
    return dict(row)


def init_auth_db() -> None:
    with _LOCK:
        conn = _conn()
        try:
            if IS_POSTGRES:
                _execute(
                    conn,
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        full_name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password_salt TEXT NOT NULL,
                        password_hash TEXT NOT NULL,
                        is_verified BOOLEAN NOT NULL DEFAULT TRUE,
                        verification_token TEXT,
                        password_reset_token TEXT,
                        password_reset_expires_at TEXT,
                        created_at TEXT NOT NULL
                    )
                    """,
                )
                _execute(
                    conn,
                    """
                    CREATE TABLE IF NOT EXISTS sessions (
                        token TEXT PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id),
                        created_at TEXT NOT NULL,
                        expires_at TEXT NOT NULL
                    )
                    """,
                )
                for ddl in [
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT TRUE",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TEXT",
                ]:
                    _execute(conn, ddl)
            else:
                _execute(
                    conn,
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        full_name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password_salt TEXT NOT NULL,
                        password_hash TEXT NOT NULL,
                        is_verified INTEGER NOT NULL DEFAULT 1,
                        verification_token TEXT,
                        password_reset_token TEXT,
                        password_reset_expires_at TEXT,
                        created_at TEXT NOT NULL
                    )
                    """,
                )
                _execute(
                    conn,
                    """
                    CREATE TABLE IF NOT EXISTS sessions (
                        token TEXT PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        created_at TEXT NOT NULL,
                        expires_at TEXT NOT NULL,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    )
                    """,
                )
                for ddl in [
                    "ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 1",
                    "ALTER TABLE users ADD COLUMN verification_token TEXT",
                    "ALTER TABLE users ADD COLUMN password_reset_token TEXT",
                    "ALTER TABLE users ADD COLUMN password_reset_expires_at TEXT",
                ]:
                    try:
                        _execute(conn, ddl)
                    except sqlite3.OperationalError:
                        pass
            conn.commit()
        finally:
            conn.close()


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _hash_password(password: str, salt_b64: str) -> str:
    salt = base64.b64decode(salt_b64.encode("utf-8"))
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return base64.b64encode(digest).decode("utf-8")


def _user_public_dict(row: dict) -> dict:
    return {
        "id": int(row["id"]),
        "full_name": row["full_name"],
        "email": row["email"],
        "is_verified": bool(row["is_verified"]),
        "created_at": row["created_at"],
    }


def _build_password_record(password: str) -> tuple[str, str]:
    salt = os.urandom(16)
    salt_b64 = base64.b64encode(salt).decode("utf-8")
    pwd_hash = _hash_password(password, salt_b64)
    return salt_b64, pwd_hash


def _generate_token() -> str:
    return secrets.token_urlsafe(32)


def create_user(full_name: str, email: str, password: str) -> tuple[dict, str]:
    email_n = _normalize_email(email)
    full_name_n = (full_name or "").strip()
    if not full_name_n:
        raise ValueError("Full name is required")
    if "@" not in email_n:
        raise ValueError("A valid email is required")
    if len(password or "") < 8:
        raise ValueError("Password must be at least 8 characters")

    salt_b64, pwd_hash = _build_password_record(password)
    verify_token = _generate_token()

    with _LOCK:
        conn = _conn()
        try:
            created_at = _utcnow_iso()
            if IS_POSTGRES:
                cur = _execute(
                    conn,
                    """
                    INSERT INTO users (
                        full_name, email, password_salt, password_hash,
                        is_verified, verification_token, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    RETURNING id
                    """,
                    (full_name_n, email_n, salt_b64, pwd_hash, False, verify_token, created_at),
                )
                user_id = int(cur.fetchone()["id"])
            else:
                cur = _execute(
                    conn,
                    """
                    INSERT INTO users (
                        full_name, email, password_salt, password_hash,
                        is_verified, verification_token, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (full_name_n, email_n, salt_b64, pwd_hash, 0, verify_token, created_at),
                )
                user_id = int(cur.lastrowid)
            conn.commit()
            row = _fetchone(conn, "SELECT * FROM users WHERE id = ?", (user_id,))
            return _user_public_dict(row), verify_token
        except Exception as exc:
            # sqlite and postgres use different exception classes
            msg = str(exc).lower()
            if "unique" in msg or "duplicate key" in msg:
                raise ValueError("Email already exists") from exc
            raise
        finally:
            conn.close()


def create_or_get_oauth_user(full_name: str, email: str) -> dict:
    email_n = _normalize_email(email)
    if "@" not in email_n:
        raise ValueError("A valid email is required")
    full_name_n = (full_name or "").strip() or email_n.split("@")[0]

    with _LOCK:
        conn = _conn()
        try:
            row = _fetchone(conn, "SELECT * FROM users WHERE email = ?", (email_n,))
            if row:
                return _user_public_dict(row)

            salt_b64, pwd_hash = _build_password_record(secrets.token_urlsafe(24))
            created_at = _utcnow_iso()
            if IS_POSTGRES:
                cur = _execute(
                    conn,
                    """
                    INSERT INTO users (
                        full_name, email, password_salt, password_hash,
                        is_verified, verification_token, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    RETURNING id
                    """,
                    (full_name_n, email_n, salt_b64, pwd_hash, True, None, created_at),
                )
                user_id = int(cur.fetchone()["id"])
            else:
                cur = _execute(
                    conn,
                    """
                    INSERT INTO users (
                        full_name, email, password_salt, password_hash,
                        is_verified, verification_token, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (full_name_n, email_n, salt_b64, pwd_hash, 1, None, created_at),
                )
                user_id = int(cur.lastrowid)
            conn.commit()
            row = _fetchone(conn, "SELECT * FROM users WHERE id = ?", (user_id,))
            return _user_public_dict(row)
        except Exception as exc:
            msg = str(exc).lower()
            if "unique" in msg or "duplicate key" in msg:
                row = _fetchone(conn, "SELECT * FROM users WHERE email = ?", (email_n,))
                if row:
                    return _user_public_dict(row)
                raise ValueError("Email already exists") from exc
            raise
        finally:
            conn.close()


def authenticate_user(email: str, password: str) -> tuple[dict | None, str | None]:
    email_n = _normalize_email(email)
    with _LOCK:
        conn = _conn()
        try:
            row = _fetchone(conn, "SELECT * FROM users WHERE email = ?", (email_n,))
            if not row:
                return None, "invalid_credentials"
            expected = row["password_hash"]
            computed = _hash_password(password or "", row["password_salt"])
            if not secrets.compare_digest(expected, computed):
                return None, "invalid_credentials"
            if not bool(row["is_verified"]):
                return _user_public_dict(row), "email_not_verified"
            return _user_public_dict(row), None
        finally:
            conn.close()


def create_session(user_id: int, days_valid: int = 7) -> str:
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=days_valid)

    with _LOCK:
        conn = _conn()
        try:
            _execute(
                conn,
                """
                INSERT INTO sessions (token, user_id, created_at, expires_at)
                VALUES (?, ?, ?, ?)
                """,
                (token, int(user_id), now.isoformat(), expires.isoformat()),
            )
            conn.commit()
            return token
        finally:
            conn.close()


def verify_email(email: str, token: str) -> dict:
    email_n = _normalize_email(email)
    token_n = (token or "").strip()
    if not token_n:
        raise ValueError("Verification token is required")
    with _LOCK:
        conn = _conn()
        try:
            row = _fetchone(conn, "SELECT * FROM users WHERE email = ?", (email_n,))
            if not row:
                raise ValueError("Invalid verification request")
            expected = row["verification_token"] or ""
            if not expected or not secrets.compare_digest(expected, token_n):
                raise ValueError("Invalid verification token")
            _execute(
                conn,
                "UPDATE users SET is_verified = ?, verification_token = NULL WHERE id = ?",
                (True if IS_POSTGRES else 1, int(row["id"])),
            )
            conn.commit()
            updated = _fetchone(conn, "SELECT * FROM users WHERE id = ?", (int(row["id"]),))
            return _user_public_dict(updated)
        finally:
            conn.close()


def issue_password_reset(email: str) -> str | None:
    email_n = _normalize_email(email)
    with _LOCK:
        conn = _conn()
        try:
            row = _fetchone(conn, "SELECT * FROM users WHERE email = ?", (email_n,))
            if not row:
                return None
            token = _generate_token()
            exp = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()
            _execute(
                conn,
                "UPDATE users SET password_reset_token = ?, password_reset_expires_at = ? WHERE id = ?",
                (token, exp, int(row["id"])),
            )
            conn.commit()
            return token
        finally:
            conn.close()


def reset_password(reset_token: str, new_password: str) -> dict:
    token_n = (reset_token or "").strip()
    if len(new_password or "") < 8:
        raise ValueError("Password must be at least 8 characters")
    if not token_n:
        raise ValueError("Reset token is required")

    with _LOCK:
        conn = _conn()
        try:
            row = _fetchone(conn, "SELECT * FROM users WHERE password_reset_token = ?", (token_n,))
            if not row:
                raise ValueError("Invalid reset token")

            expires_at = row["password_reset_expires_at"] or ""
            if _is_expired(expires_at):
                raise ValueError("Reset token has expired")

            salt = os.urandom(16)
            salt_b64 = base64.b64encode(salt).decode("utf-8")
            pwd_hash = _hash_password(new_password, salt_b64)
            _execute(
                conn,
                """
                UPDATE users
                SET password_salt = ?, password_hash = ?,
                    password_reset_token = NULL, password_reset_expires_at = NULL
                WHERE id = ?
                """,
                (salt_b64, pwd_hash, int(row["id"])),
            )
            conn.commit()
            updated = _fetchone(conn, "SELECT * FROM users WHERE id = ?", (int(row["id"]),))
            return _user_public_dict(updated)
        finally:
            conn.close()


def _is_expired(expires_at: str) -> bool:
    try:
        exp = datetime.fromisoformat(expires_at)
    except Exception:
        return True
    return exp < datetime.now(timezone.utc)


def get_user_by_token(token: str) -> dict | None:
    token = (token or "").strip()
    if not token:
        return None

    with _LOCK:
        conn = _conn()
        try:
            row = _fetchone(
                conn,
                """
                SELECT s.token, s.expires_at, u.*
                FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token = ?
                """,
                (token,),
            )
            if not row:
                return None
            if _is_expired(row["expires_at"]):
                _execute(conn, "DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
                return None
            return _user_public_dict(row)
        finally:
            conn.close()


def delete_session(token: str) -> None:
    token = (token or "").strip()
    if not token:
        return
    with _LOCK:
        conn = _conn()
        try:
            _execute(conn, "DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
        finally:
            conn.close()

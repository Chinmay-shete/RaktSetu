"""Authentication business logic."""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Any

from middleware.errors import ApiError
from schemas.auth_schemas import (
    DonorRegisterSchema,
    HospitalRegisterSchema,
    LoginSchema,
    SetPasswordSchema,
)
from services.db import get_connection
from services.jwt_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_otp_verification_token,
)
from services.password_service import hash_password, verify_password


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def serialize_user(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "email": row["email"],
        "phone": row["phone"],
        "role": row["role"],
        "hospital_id": row["hospital_id"],
        "district_id": row["district_id"],
        "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        "last_login": row["last_login"].isoformat() if row.get("last_login") else None,
    }


def _issue_tokens(user: dict[str, Any]) -> dict[str, Any]:
    access_token = create_access_token(
        user["id"],
        user["role"],
        hospital_id=user.get("hospital_id"),
        district_id=user.get("district_id"),
    )
    refresh_token, expires_at = create_refresh_token(user["id"])
    token_hash = _hash_refresh_token(refresh_token)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
            VALUES (%s, %s, %s)
            """,
            (user["id"], token_hash, expires_at.replace(tzinfo=None)),
        )
        conn.commit()
        cursor.close()

    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": serialize_user(user),
        "role": user["role"],
    }


def _get_user_by_id(user_id: int) -> dict[str, Any] | None:
    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        cursor.close()
        return row


def _get_user_by_email(email: str) -> dict[str, Any] | None:
    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email.lower(),))
        row = cursor.fetchone()
        cursor.close()
        return row


def _get_user_by_phone(phone: str) -> dict[str, Any] | None:
    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE phone = %s", (phone,))
        row = cursor.fetchone()
        cursor.close()
        return row


def _find_or_create_district(city: str, state: str, cursor) -> int:
    cursor.execute(
        """
        SELECT id FROM districts
        WHERE name = %s AND state = %s
        LIMIT 1
        """,
        (city, state),
    )
    row = cursor.fetchone()
    if row:
        return row["id"] if isinstance(row, dict) else row[0]

    cursor.execute(
        """
        INSERT INTO districts (name, state)
        VALUES (%s, %s)
        """,
        (city, state),
    )
    return cursor.lastrowid


def register_donor(data: DonorRegisterSchema) -> dict[str, Any]:
    verify_otp_verification_token(data.verification_token, data.phone, "registration")

    if _get_user_by_phone(data.phone):
        raise ApiError("Phone number already registered", status_code=409, code="PHONE_EXISTS")

    email = data.email.lower() if data.email else f"{data.phone}@donor.raktsetu.local"
    if _get_user_by_email(email):
        raise ApiError("Email already registered", status_code=409, code="EMAIL_EXISTS")

    password_hash = hash_password(data.password) if data.password else None

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO users (email, phone, password_hash, role)
            VALUES (%s, %s, %s, 'donor')
            """,
            (email, data.phone, password_hash),
        )
        user_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()

    return _issue_tokens(user)


def register_hospital(data: HospitalRegisterSchema) -> dict[str, Any]:
    email = data.email.lower()

    if _get_user_by_email(email):
        raise ApiError("Email already registered", status_code=409, code="EMAIL_EXISTS")

    hospital = data.hospital

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        district_id = _find_or_create_district(hospital.city, hospital.state, cursor)

        cursor.execute(
            """
            INSERT INTO hospitals (
              name, district_id, type, lat, lng, location,
              license_no, address, contact, verification_status
            )
            VALUES (
              %s, %s, %s, %s, %s,
              ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
              %s, %s, %s, 'pending'
            )
            """,
            (
                hospital.name,
                district_id,
                hospital.type,
                hospital.lat,
                hospital.lng,
                hospital.lng,
                hospital.lat,
                hospital.license_no,
                hospital.address,
                hospital.phone,
            ),
        )
        hospital_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO users (email, phone, password_hash, role, hospital_id)
            VALUES (%s, %s, %s, 'admin', %s)
            """,
            (email, hospital.phone, hash_password(data.password), hospital_id),
        )
        user_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()

    tokens = _issue_tokens(user)
    tokens["message"] = "Hospital registration submitted. Awaiting verification."
    return tokens


def login(data: LoginSchema) -> dict[str, Any]:
    if data.email:
        user = _get_user_by_email(data.email.lower())
        if not user or not verify_password(user.get("password_hash"), data.password or ""):
            raise ApiError("Invalid email or password", status_code=401, code="INVALID_CREDENTIALS")
    else:
        verify_otp_verification_token(
            data.verification_token or "",
            data.phone or "",
            "login",
        )
        user = _get_user_by_phone(data.phone or "")
        if not user:
            raise ApiError("No account found for this phone", status_code=404, code="USER_NOT_FOUND")
        if user["role"] != "donor":
            raise ApiError(
                "Phone OTP login is only available for donors",
                status_code=403,
                code="OTP_LOGIN_FORBIDDEN",
            )

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET last_login = %s WHERE id = %s",
            (_utcnow_naive(), user["id"]),
        )
        conn.commit()
        cursor.close()

    user["last_login"] = _utcnow_naive()
    return _issue_tokens(user)


def logout(refresh_token: str) -> dict[str, str]:
    payload = decode_token(refresh_token, expected_type="refresh")
    token_hash = _hash_refresh_token(refresh_token)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE refresh_tokens
            SET revoked_at = %s
            WHERE token_hash = %s AND user_id = %s AND revoked_at IS NULL
            """,
            (_utcnow_naive(), token_hash, int(payload["sub"])),
        )
        conn.commit()
        cursor.close()

    return {"message": "Logged out successfully"}


def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    payload = decode_token(refresh_token, expected_type="refresh")
    user_id = int(payload["sub"])
    token_hash = _hash_refresh_token(refresh_token)
    now = _utcnow_naive()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, revoked_at, expires_at
            FROM refresh_tokens
            WHERE token_hash = %s AND user_id = %s
            LIMIT 1
            """,
            (token_hash, user_id),
        )
        stored = cursor.fetchone()
        cursor.close()

    if not stored or stored["revoked_at"] is not None:
        raise ApiError("Refresh token revoked", status_code=401, code="TOKEN_REVOKED")
    if stored["expires_at"] < now:
        raise ApiError("Refresh token expired", status_code=401, code="TOKEN_EXPIRED")

    user = _get_user_by_id(user_id)
    if not user:
        raise ApiError("User not found", status_code=404, code="USER_NOT_FOUND")

    access_token = create_access_token(
        user["id"],
        user["role"],
        hospital_id=user.get("hospital_id"),
        district_id=user.get("district_id"),
    )

    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": serialize_user(user),
        "role": user["role"],
    }


def validate_invite_token(token: str) -> dict[str, Any]:
    now = _utcnow_naive()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT si.email, si.expires_at, si.used_at, h.name AS hospital_name
            FROM staff_invites si
            INNER JOIN hospitals h ON h.id = si.hospital_id
            WHERE si.token = %s
            LIMIT 1
            """,
            (token,),
        )
        invite = cursor.fetchone()
        cursor.close()

    if not invite:
        raise ApiError("Invalid invite token", status_code=404, code="INVALID_INVITE")

    if invite["used_at"] is not None:
        raise ApiError("Invite token already used", status_code=410, code="INVITE_USED")

    if invite["expires_at"] < now:
        raise ApiError("Invite token expired", status_code=410, code="INVITE_EXPIRED")

    return {
        "name": invite["hospital_name"],
        "email": invite["email"],
    }


def set_password(data: SetPasswordSchema) -> dict[str, str]:
    now = _utcnow_naive()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, email, hospital_id, expires_at, used_at
            FROM staff_invites
            WHERE token = %s
            LIMIT 1
            """,
            (data.token,),
        )
        invite = cursor.fetchone()

        if not invite:
            raise ApiError("Invalid invite token", status_code=404, code="INVALID_INVITE")

        if invite["used_at"] is not None:
            raise ApiError("Invite token already used", status_code=410, code="INVITE_USED")

        if invite["expires_at"] < now:
            raise ApiError("Invite token expired", status_code=410, code="INVITE_EXPIRED")

        cursor.execute("SELECT id FROM users WHERE email = %s", (invite["email"],))
        existing = cursor.fetchone()
        if existing:
            raise ApiError("User already exists for this invite", status_code=409, code="USER_EXISTS")

        cursor.execute(
            """
            INSERT INTO users (email, password_hash, role, hospital_id)
            VALUES (%s, %s, 'staff', %s)
            """,
            (invite["email"], hash_password(data.password), invite["hospital_id"]),
        )
        cursor.execute(
            """
            UPDATE staff_invites
            SET used_at = %s
            WHERE id = %s
            """,
            (now, invite["id"]),
        )
        conn.commit()
        cursor.close()

    return {"message": "Password set successfully. You can now log in."}


def create_staff_invite(
    email: str,
    hospital_id: int,
    invited_by: int | None = None,
    expires_days: int = 7,
) -> dict[str, str]:
    """Helper for hospital admins to invite staff (used by Phase 3 endpoints)."""
    token = secrets.token_urlsafe(32)
    expires_at = _utcnow_naive()
    from datetime import timedelta

    expires_at = expires_at + timedelta(days=expires_days)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO staff_invites (token, email, hospital_id, invited_by, expires_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (token, email.lower(), hospital_id, invited_by, expires_at),
        )
        conn.commit()
        cursor.close()

    return {"token": token, "email": email.lower()}

"""OTP generation and persistence."""

from __future__ import annotations

import random
import secrets
from datetime import datetime, timedelta, timezone

from config.settings import get_settings
from middleware.errors import ApiError
from services.db import get_connection
from services.jwt_service import create_otp_verification_token


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _generate_code(length: int) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def send_otp(phone: str, purpose: str) -> dict:
    settings = get_settings()
    code = _generate_code(settings.otp_length)
    expires_at = _utcnow() + timedelta(minutes=settings.otp_expires_minutes)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE otp_codes
            SET verified = 1
            WHERE phone = %s AND purpose = %s AND verified = 0
            """,
            (phone, purpose),
        )
        cursor.execute(
            """
            INSERT INTO otp_codes (phone, code, purpose, expires_at)
            VALUES (%s, %s, %s, %s)
            """,
            (phone, code, purpose, expires_at.replace(tzinfo=None)),
        )
        conn.commit()
        cursor.close()

    # Development convenience — replace with SMS provider in production.
    print(f"[RaktSetu OTP] phone={phone} purpose={purpose} code={code}")

    return {
        "message": "OTP sent successfully",
        "expires_in": settings.otp_expires_minutes * 60,
    }


def verify_otp(phone: str, otp: str, purpose: str) -> dict:
    now = _utcnow().replace(tzinfo=None)

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, code, expires_at, verified
            FROM otp_codes
            WHERE phone = %s AND purpose = %s AND verified = 0
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (phone, purpose),
        )
        row = cursor.fetchone()

        if not row:
            raise ApiError("No active OTP found for this phone", status_code=400, code="OTP_NOT_FOUND")

        if row["verified"]:
            raise ApiError("OTP already used", status_code=400, code="OTP_ALREADY_USED")

        if row["expires_at"] < now:
            raise ApiError("OTP has expired", status_code=400, code="OTP_EXPIRED")

        if not secrets.compare_digest(row["code"], otp):
            raise ApiError("Invalid OTP", status_code=400, code="INVALID_OTP")

        cursor.execute(
            "UPDATE otp_codes SET verified = 1 WHERE id = %s",
            (row["id"],),
        )
        conn.commit()
        cursor.close()

    verification_token = create_otp_verification_token(phone, purpose)
    return {
        "message": "OTP verified successfully",
        "verification_token": verification_token,
        "phone": phone,
    }

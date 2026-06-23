"""JWT access, refresh, and OTP verification tokens."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from config.settings import Settings, get_settings
from middleware.errors import ApiError

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"
TOKEN_TYPE_OTP = "otp_verification"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _encode(payload: dict[str, Any], settings: Settings | None = None) -> str:
    cfg = settings or get_settings()
    return jwt.encode(payload, cfg.secret_key, algorithm="HS256")


def _decode(token: str, settings: Settings | None = None) -> dict[str, Any]:
    cfg = settings or get_settings()
    try:
        return jwt.decode(token, cfg.secret_key, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise ApiError("Token has expired", status_code=401, code="TOKEN_EXPIRED") from exc
    except jwt.InvalidTokenError as exc:
        raise ApiError("Invalid token", status_code=401, code="INVALID_TOKEN") from exc


def create_access_token(
    user_id: int,
    role: str,
    *,
    hospital_id: int | None = None,
    district_id: int | None = None,
    settings: Settings | None = None,
) -> str:
    cfg = settings or get_settings()
    expires = _utcnow() + timedelta(minutes=cfg.jwt_access_expires_minutes)
    payload = {
        "sub": str(user_id),
        "role": role,
        "hospital_id": hospital_id,
        "district_id": district_id,
        "type": TOKEN_TYPE_ACCESS,
        "exp": expires,
        "iat": _utcnow(),
    }
    return _encode(payload, cfg)


def create_refresh_token(user_id: int, settings: Settings | None = None) -> tuple[str, datetime]:
    cfg = settings or get_settings()
    expires = _utcnow() + timedelta(days=cfg.jwt_refresh_expires_days)
    payload = {
        "sub": str(user_id),
        "type": TOKEN_TYPE_REFRESH,
        "exp": expires,
        "iat": _utcnow(),
    }
    return _encode(payload, cfg), expires


def create_otp_verification_token(
    phone: str,
    purpose: str,
    settings: Settings | None = None,
) -> str:
    cfg = settings or get_settings()
    expires = _utcnow() + timedelta(minutes=cfg.otp_expires_minutes)
    payload = {
        "phone": phone,
        "purpose": purpose,
        "type": TOKEN_TYPE_OTP,
        "exp": expires,
        "iat": _utcnow(),
    }
    return _encode(payload, cfg)


def decode_token(token: str, *, expected_type: str | None = None) -> dict[str, Any]:
    payload = _decode(token)
    if expected_type and payload.get("type") != expected_type:
        raise ApiError("Invalid token type", status_code=401, code="INVALID_TOKEN_TYPE")
    return payload


def verify_otp_verification_token(token: str, phone: str, purpose: str) -> None:
    payload = decode_token(token, expected_type=TOKEN_TYPE_OTP)
    if payload.get("phone") != phone:
        raise ApiError("OTP verification token does not match phone", status_code=401, code="INVALID_OTP_TOKEN")
    if payload.get("purpose") != purpose:
        raise ApiError("OTP verification token purpose mismatch", status_code=401, code="INVALID_OTP_TOKEN")

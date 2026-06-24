"""Authentication route handlers."""

from schemas.auth_schemas import (
    LoginSchema,
    LogoutSchema,
    RefreshTokenSchema,
    RegisterSchema,
    SendOtpSchema,
    SetPasswordSchema,
    VerifyOtpSchema,
)
from services import auth_service, otp_service


def send_otp(data: SendOtpSchema) -> tuple[dict, int]:
    return otp_service.send_otp(data.phone, data.purpose), 200


def verify_otp(data: VerifyOtpSchema) -> tuple[dict, int]:
    return otp_service.verify_otp(data.phone, data.otp, data.purpose), 200


def register(data: RegisterSchema) -> tuple[dict, int]:
    if data.role == "donor":
        return auth_service.register_donor(data.to_donor()), 201
    return auth_service.register_hospital(data.to_hospital()), 201


def login(data: LoginSchema) -> tuple[dict, int]:
    return auth_service.login(data), 200


def logout(data: LogoutSchema) -> tuple[dict, int]:
    return auth_service.logout(data.refresh_token), 200


def validate_invite_token(token: str) -> tuple[dict, int]:
    return auth_service.validate_invite_token(token), 200


def set_password(data: SetPasswordSchema) -> tuple[dict, int]:
    return auth_service.set_password(data), 200


def refresh(data: RefreshTokenSchema) -> tuple[dict, int]:
    return auth_service.refresh_access_token(data.refresh_token), 200

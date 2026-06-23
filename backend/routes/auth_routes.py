from flask import Blueprint, jsonify

from controllers import auth_controller
from middleware.auth import require_auth
from middleware.validation import validate_request
from schemas.auth_schemas import (
    LoginSchema,
    LogoutSchema,
    RefreshTokenSchema,
    RegisterSchema,
    SendOtpSchema,
    SetPasswordSchema,
    VerifyOtpSchema,
    validate_login,
    validate_logout,
    validate_refresh,
    validate_register,
    validate_send_otp,
    validate_set_password,
    validate_verify_otp,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/send-otp")
@validate_request(validate_send_otp)
def send_otp_route(data: SendOtpSchema):
    body, status = auth_controller.send_otp(data)
    return jsonify(body), status


@auth_bp.post("/verify-otp")
@validate_request(validate_verify_otp)
def verify_otp_route(data: VerifyOtpSchema):
    body, status = auth_controller.verify_otp(data)
    return jsonify(body), status


@auth_bp.post("/register")
@validate_request(validate_register)
def register_route(data: RegisterSchema):
    body, status = auth_controller.register(data)
    return jsonify(body), status


@auth_bp.post("/login")
@validate_request(validate_login)
def login_route(data: LoginSchema):
    body, status = auth_controller.login(data)
    return jsonify(body), status


@auth_bp.post("/logout")
@require_auth
@validate_request(validate_logout)
def logout_route(data: LogoutSchema):
    body, status = auth_controller.logout(data)
    return jsonify(body), status


@auth_bp.get("/validate-invite-token/<token>")
def validate_invite_token_route(token: str):
    body, status = auth_controller.validate_invite_token(token)
    return jsonify(body), status


@auth_bp.post("/set-password")
@validate_request(validate_set_password)
def set_password_route(data: SetPasswordSchema):
    body, status = auth_controller.set_password(data)
    return jsonify(body), status


@auth_bp.post("/refresh")
@validate_request(validate_refresh)
def refresh_route(data: RefreshTokenSchema):
    body, status = auth_controller.refresh(data)
    return jsonify(body), status

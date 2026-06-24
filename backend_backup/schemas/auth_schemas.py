"""Cerberus validation schemas for authentication endpoints."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Optional

from cerberus import Validator

PHONE_PATTERN = re.compile(r"^\d{10}$")
PINCODE_PATTERN = re.compile(r"^\d{6}$")
HOSPITAL_TYPES = {"government", "private", "charitable", "blood_bank"}


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if not PHONE_PATTERN.match(digits):
        raise ValueError("Phone must be a 10-digit Indian mobile number")
    return digits


def normalize_hospital_type(value: str) -> str:
    normalized = value.strip().lower().replace(" ", "_")
    mapping = {
        "government": "government",
        "govt": "government",
        "private": "private",
        "charitable": "charitable",
        "blood_bank": "blood_bank",
        "bloodbank": "blood_bank",
    }
    hospital_type = mapping.get(normalized, normalized)
    if hospital_type not in HOSPITAL_TYPES:
        raise ValueError(
            "Hospital type must be one of: government, private, charitable, blood_bank"
        )
    return hospital_type


def _email_validator(field, value, error):
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value or ""):
        error(field, "Must be a valid email address")


def _phone_validator(field, value, error):
    try:
        normalize_phone(value)
    except ValueError as exc:
        error(field, str(exc))


def _otp_validator(field, value, error):
    if not value or not value.isdigit() or len(value) != 6:
        error(field, "OTP must be exactly 6 digits")


SEND_OTP_SCHEMA = {
    "phone": {"required": True, "check_with": _phone_validator},
    "purpose": {"required": False, "default": "registration", "allowed": ["registration", "login"]},
}

VERIFY_OTP_SCHEMA = {
    "phone": {"required": True, "check_with": _phone_validator},
    "otp": {"required": True, "check_with": _otp_validator},
    "purpose": {"required": False, "default": "registration", "allowed": ["registration", "login"]},
}

HOSPITAL_DETAILS_SCHEMA = {
    "name": {"required": True, "type": "string", "minlength": 2, "maxlength": 255},
    "type": {"required": False, "type": "string", "default": "private"},
    "address": {"required": True, "type": "string", "minlength": 5},
    "city": {"required": True, "type": "string", "minlength": 2, "maxlength": 100},
    "state": {"required": True, "type": "string", "minlength": 2, "maxlength": 100},
    "pincode": {"required": True, "regex": r"^\d{6}$"},
    "phone": {"required": True, "check_with": _phone_validator},
    "license_no": {"required": True, "type": "string", "minlength": 3, "maxlength": 100},
    "lat": {"required": True, "type": "float", "min": -90, "max": 90},
    "lng": {"required": True, "type": "float", "min": -180, "max": 180},
    "admin_name": {"required": False, "type": "string", "maxlength": 150},
}

REGISTER_SCHEMA = {
    "role": {"required": True, "allowed": ["donor", "admin"]},
    "phone": {"required": False, "check_with": _phone_validator, "nullable": True},
    "verification_token": {"required": False, "type": "string", "nullable": True},
    "password": {"required": False, "type": "string", "minlength": 6, "maxlength": 128, "nullable": True},
    "email": {"required": False, "check_with": _email_validator, "nullable": True},
    "hospital": {"required": False, "type": "dict", "nullable": True},
}

LOGIN_SCHEMA = {
    "email": {"required": False, "check_with": _email_validator, "nullable": True},
    "password": {"required": False, "type": "string", "minlength": 6, "maxlength": 128, "nullable": True},
    "phone": {"required": False, "check_with": _phone_validator, "nullable": True},
    "verification_token": {"required": False, "type": "string", "nullable": True},
}

LOGOUT_SCHEMA = {"refresh_token": {"required": True, "type": "string", "minlength": 10}}

REFRESH_SCHEMA = {"refresh_token": {"required": True, "type": "string", "minlength": 10}}

SET_PASSWORD_SCHEMA = {
    "token": {"required": True, "type": "string", "minlength": 10, "maxlength": 64},
    "password": {"required": True, "type": "string", "minlength": 8, "maxlength": 128},
}


@dataclass
class SendOtpSchema:
    phone: str
    purpose: str = "registration"


@dataclass
class VerifyOtpSchema:
    phone: str
    otp: str
    purpose: str = "registration"


@dataclass
class HospitalDetailsSchema:
    name: str
    type: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    license_no: str
    lat: float
    lng: float
    admin_name: Optional[str] = None


@dataclass
class DonorRegisterSchema:
    phone: str
    verification_token: str
    password: Optional[str] = None
    email: Optional[str] = None


@dataclass
class HospitalRegisterSchema:
    email: str
    password: str
    hospital: HospitalDetailsSchema


@dataclass
class RegisterSchema:
    role: str
    phone: Optional[str] = None
    verification_token: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    hospital: Optional[HospitalDetailsSchema] = None

    def to_donor(self) -> DonorRegisterSchema:
        return DonorRegisterSchema(
            phone=self.phone or "",
            verification_token=self.verification_token or "",
            password=self.password,
            email=self.email,
        )

    def to_hospital(self) -> HospitalRegisterSchema:
        return HospitalRegisterSchema(
            email=self.email or "",
            password=self.password or "",
            hospital=self.hospital or HospitalDetailsSchema(
                name="",
                type="private",
                address="",
                city="",
                state="",
                pincode="000000",
                phone="0000000000",
                license_no="",
                lat=0.0,
                lng=0.0,
            ),
        )


@dataclass
class LoginSchema:
    email: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    verification_token: Optional[str] = None


@dataclass
class LogoutSchema:
    refresh_token: str


@dataclass
class RefreshTokenSchema:
    refresh_token: str


@dataclass
class SetPasswordSchema:
    token: str
    password: str


def _validate_with(schema: dict, payload: dict) -> dict:
    validator = Validator(schema, allow_unknown=False)
    if not validator.validate(payload or {}):
        messages = []
        for field, errors in validator.errors.items():
            for err in errors:
                messages.append(f"{field}: {err}")
        raise ValueError("; ".join(messages))
    return validator.normalized(payload or {})


def _hospital_from_dict(data: dict) -> HospitalDetailsSchema:
    hospital_validator = Validator(HOSPITAL_DETAILS_SCHEMA, allow_unknown=False)
    if not hospital_validator.validate(data):
        messages = []
        for field, errors in hospital_validator.errors.items():
            for err in errors:
                messages.append(f"hospital.{field}: {err}")
        raise ValueError("; ".join(messages))
    normalized = hospital_validator.normalized(data)
    return HospitalDetailsSchema(
        name=normalized["name"],
        type=normalize_hospital_type(normalized.get("type", "private")),
        address=normalized["address"],
        city=normalized["city"],
        state=normalized["state"],
        pincode=normalized["pincode"],
        phone=normalize_phone(normalized["phone"]),
        license_no=normalized["license_no"],
        lat=float(normalized["lat"]),
        lng=float(normalized["lng"]),
        admin_name=normalized.get("admin_name"),
    )


def validate_send_otp(payload: dict) -> SendOtpSchema:
    data = _validate_with(SEND_OTP_SCHEMA, payload)
    return SendOtpSchema(phone=normalize_phone(data["phone"]), purpose=data["purpose"])


def validate_verify_otp(payload: dict) -> VerifyOtpSchema:
    data = _validate_with(VERIFY_OTP_SCHEMA, payload)
    return VerifyOtpSchema(
        phone=normalize_phone(data["phone"]),
        otp=data["otp"],
        purpose=data["purpose"],
    )


def validate_register(payload: dict) -> RegisterSchema:
    data = _validate_with(REGISTER_SCHEMA, payload)
    role = data["role"]

    if role == "donor":
        if not data.get("phone") or not data.get("verification_token"):
            raise ValueError("Donor registration requires phone and verification_token")
        if data.get("password") and len(data["password"]) < 6:
            raise ValueError("password: min length is 6")
        return RegisterSchema(
            role="donor",
            phone=normalize_phone(data["phone"]),
            verification_token=data["verification_token"],
            password=data.get("password"),
            email=data.get("email"),
        )

    if not data.get("email") or not data.get("password") or not data.get("hospital"):
        raise ValueError("Hospital registration requires email, password, and hospital details")
    if len(data["password"]) < 8:
        raise ValueError("password: min length is 8 for hospital admin accounts")

    hospital = _hospital_from_dict(data["hospital"])
    return RegisterSchema(
        role="admin",
        email=data["email"].lower(),
        password=data["password"],
        hospital=hospital,
    )


def validate_login(payload: dict) -> LoginSchema:
    data = _validate_with(LOGIN_SCHEMA, payload)
    has_email = bool(data.get("email") and data.get("password"))
    has_phone = bool(data.get("phone") and data.get("verification_token"))

    if has_email == has_phone:
        raise ValueError("Provide either email+password or phone+verification_token")

    if has_email:
        return LoginSchema(email=data["email"].lower(), password=data["password"])

    return LoginSchema(
        phone=normalize_phone(data["phone"]),
        verification_token=data["verification_token"],
    )


def validate_logout(payload: dict) -> LogoutSchema:
    data = _validate_with(LOGOUT_SCHEMA, payload)
    return LogoutSchema(refresh_token=data["refresh_token"])


def validate_refresh(payload: dict) -> RefreshTokenSchema:
    data = _validate_with(REFRESH_SCHEMA, payload)
    return RefreshTokenSchema(refresh_token=data["refresh_token"])


def validate_set_password(payload: dict) -> SetPasswordSchema:
    data = _validate_with(SET_PASSWORD_SCHEMA, payload)
    return SetPasswordSchema(token=data["token"], password=data["password"])

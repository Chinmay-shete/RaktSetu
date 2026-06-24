"""Cerberus validators for donor and landing endpoints."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from cerberus import Validator

from services.donor_formatters import (
    blood_group_from_api,
    donation_type_from_api,
    gender_from_api,
)

PINCODE_PATTERN = re.compile(r"^\d{6}$")


def _email_validator(field, value, error):
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value or ""):
        error(field, "Must be a valid email address")


PROFILE_CREATE_SCHEMA = {
    "fullName": {"required": True, "type": "string", "minlength": 2, "maxlength": 150},
    "age": {"required": True, "type": "integer", "min": 18, "max": 65},
    "gender": {"required": True, "type": "string"},
    "bloodGroup": {"required": True, "type": "string"},
    "city": {"required": False, "type": "string", "nullable": True},
    "pincode": {"required": False, "regex": r"^\d{6}$", "nullable": True},
    "weight": {"required": False, "type": "float", "min": 30, "max": 200, "nullable": True},
    "chronicIllness": {"required": False, "type": "boolean", "nullable": True},
    "lastDonatedDate": {"required": False, "type": "string", "nullable": True},
}

PROFILE_UPDATE_SCHEMA = {
    "fullName": {"required": False, "type": "string", "minlength": 2, "maxlength": 150},
    "age": {"required": False, "type": "integer", "min": 18, "max": 65},
    "gender": {"required": False, "type": "string"},
    "city": {"required": False, "type": "string"},
    "pincode": {"required": False, "regex": r"^\d{6}$"},
    "weight": {"required": False, "type": "float", "min": 30, "max": 200, "nullable": True},
    "chronicIllness": {"required": False, "nullable": True},
    "availableForDonation": {"required": False, "type": "boolean"},
    "notifySMS": {"required": False, "type": "boolean"},
    "notifyWhatsApp": {"required": False, "type": "boolean"},
    "notifyEmail": {"required": False, "type": "boolean"},
}

LOCATION_SCHEMA = {
    "lat": {"required": True, "type": "float", "min": -90, "max": 90},
    "lng": {"required": True, "type": "float", "min": -180, "max": 180},
    "city": {"required": False, "type": "string", "nullable": True},
    "pincode": {"required": False, "regex": r"^\d{6}$", "nullable": True},
}

PLEDGE_SCHEMA = {
    "emergency_id": {"required": True, "type": "integer", "min": 1},
}

DEMO_REQUEST_SCHEMA = {
    "email": {"required": True, "check_with": _email_validator},
}


@dataclass
class ProfileCreateData:
    full_name: str
    age: int
    gender: str
    blood_group: str
    city: Optional[str] = None
    pincode: Optional[str] = None
    weight: Optional[float] = None
    chronic_illness: Optional[bool] = None
    last_donated_date: Optional[str] = None


@dataclass
class ProfileUpdateData:
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    weight: Optional[float] = None
    chronic_illness: Optional[bool] = None
    available_for_donation: Optional[bool] = None


@dataclass
class LocationData:
    lat: float
    lng: float
    city: Optional[str] = None
    pincode: Optional[str] = None


@dataclass
class PledgeData:
    emergency_id: int


@dataclass
class DemoRequestData:
    email: str


def _validate(schema: dict, payload: dict) -> dict:
    validator = Validator(schema, allow_unknown=False)
    if not validator.validate(payload or {}):
        messages = []
        for field, errors in validator.errors.items():
            for err in errors:
                messages.append(f"{field}: {err}")
        raise ValueError("; ".join(messages))
    return validator.normalized(payload or {})


def validate_profile_create(payload: dict) -> ProfileCreateData:
    data = _validate(PROFILE_CREATE_SCHEMA, payload)
    return ProfileCreateData(
        full_name=data["fullName"].strip(),
        age=int(data["age"]),
        gender=gender_from_api(data["gender"]),
        blood_group=blood_group_from_api(data["bloodGroup"]),
        city=data.get("city"),
        pincode=data.get("pincode"),
        weight=float(data["weight"]) if data.get("weight") is not None else None,
        chronic_illness=data.get("chronicIllness"),
        last_donated_date=data.get("lastDonatedDate"),
    )


def validate_profile_update(payload: dict) -> ProfileUpdateData:
    data = _validate(PROFILE_UPDATE_SCHEMA, payload)
    chronic = data.get("chronicIllness")
    if chronic is not None and not isinstance(chronic, bool):
        if isinstance(chronic, str):
            chronic = chronic.lower() in ("true", "1", "yes")
        else:
            chronic = bool(chronic)

    return ProfileUpdateData(
        full_name=data.get("fullName"),
        age=int(data["age"]) if data.get("age") is not None else None,
        gender=gender_from_api(data["gender"]) if data.get("gender") else None,
        city=data.get("city"),
        pincode=data.get("pincode"),
        weight=float(data["weight"]) if data.get("weight") is not None else None,
        chronic_illness=chronic,
        available_for_donation=data.get("availableForDonation"),
    )


def validate_location(payload: dict) -> LocationData:
    data = _validate(LOCATION_SCHEMA, payload)
    return LocationData(
        lat=float(data["lat"]),
        lng=float(data["lng"]),
        city=data.get("city"),
        pincode=data.get("pincode"),
    )


def validate_pledge(payload: dict) -> PledgeData:
    normalized = dict(payload or {})
    if "emergencyId" in normalized and "emergency_id" not in normalized:
        normalized["emergency_id"] = normalized["emergencyId"]
    data = _validate(PLEDGE_SCHEMA, normalized)
    return PledgeData(emergency_id=int(data["emergency_id"]))


def validate_demo_request(payload: dict) -> DemoRequestData:
    data = _validate(DEMO_REQUEST_SCHEMA, payload)
    return DemoRequestData(email=data["email"].lower().strip())

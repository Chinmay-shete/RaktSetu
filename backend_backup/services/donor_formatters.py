"""Blood group and gender helpers for API ↔ DB mapping."""

from __future__ import annotations

BLOOD_GROUP_TO_API = {
    "O+": "O-Positive",
    "O-": "O-Negative",
    "A+": "A-Positive",
    "A-": "A-Negative",
    "B+": "B-Positive",
    "B-": "B-Negative",
    "AB+": "AB-Positive",
    "AB-": "AB-Negative",
}

BLOOD_GROUP_FROM_API = {
    "o-positive": "O+",
    "o+": "O+",
    "o−": "O-",
    "o-": "O-",
    "o-negative": "O-",
    "a-positive": "A+",
    "a+": "A+",
    "a−": "A-",
    "a-": "A-",
    "a-negative": "A-",
    "b-positive": "B+",
    "b+": "B+",
    "b−": "B-",
    "b-": "B-",
    "b-negative": "B-",
    "ab-positive": "AB+",
    "ab+": "AB+",
    "ab−": "AB-",
    "ab-": "AB-",
    "ab-negative": "AB-",
}

GENDER_TO_API = {
    "male": "Male",
    "female": "Female",
    "other": "Prefer not to say",
}

GENDER_FROM_API = {
    "male": "male",
    "female": "female",
    "non-binary": "other",
    "prefer not to say": "other",
    "other": "other",
}

DONATION_TYPE_TO_API = {
    "whole_blood": "Whole Blood",
    "platelets": "Platelets",
    "plasma": "Plasma",
}

DONATION_TYPE_FROM_API = {
    "whole blood": "whole_blood",
    "whole_blood": "whole_blood",
    "blood": "whole_blood",
    "platelets": "platelets",
    "plasma": "plasma",
}


def blood_group_to_api(value: str | None) -> str | None:
    if not value:
        return None
    if value in BLOOD_GROUP_TO_API:
        return BLOOD_GROUP_TO_API[value]
    return value


def blood_group_from_api(value: str) -> str:
    key = value.strip().lower().replace(" ", "-")
    if key in BLOOD_GROUP_FROM_API:
        return BLOOD_GROUP_FROM_API[key]
    if value in BLOOD_GROUP_TO_API:
        return value
    raise ValueError("Invalid blood group")


def gender_to_api(value: str | None) -> str | None:
    if not value:
        return None
    return GENDER_TO_API.get(value, value)


def gender_from_api(value: str) -> str:
    key = value.strip().lower()
    if key in GENDER_FROM_API:
        return GENDER_FROM_API[key]
    if key in ("male", "female", "other"):
        return key
    raise ValueError("Invalid gender")


def donation_type_from_api(value: str) -> str:
    key = value.strip().lower()
    if key in DONATION_TYPE_FROM_API:
        return DONATION_TYPE_FROM_API[key]
    raise ValueError("Invalid donation type")

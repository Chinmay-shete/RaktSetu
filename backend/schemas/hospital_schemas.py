"""Cerberus validators for hospital portal endpoints."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from cerberus import Validator

from services.donor_formatters import blood_group_from_api

INVENTORY_CREATE_SCHEMA = {
    "bloodGroup": {"required": True, "type": "string"},
    "units": {"required": True, "type": "integer", "min": 1},
    "collectionDate": {"required": True, "type": "string"},
    "expiryDate": {"required": True, "type": "string"},
    "source": {"required": True, "type": "string", "minlength": 2, "maxlength": 100},
    "remarks": {"required": False, "type": "string", "nullable": True, "maxlength": 500},
}

INVENTORY_UPDATE_SCHEMA = {
    "units": {"required": False, "type": "integer", "min": 1},
    "reservedUnits": {"required": False, "type": "integer", "min": 0},
    "collectionDate": {"required": False, "type": "string"},
    "expiryDate": {"required": False, "type": "string"},
    "source": {"required": False, "type": "string", "minlength": 2, "maxlength": 100},
    "remarks": {"required": False, "type": "string", "nullable": True, "maxlength": 500},
}

EMERGENCY_STATUS_SCHEMA = {
    "status": {"required": True, "allowed": ["Accepted", "Declined", "accepted", "declined"]},
}

EMERGENCY_SEARCH_QUERY = {
    "bloodGroup": {"required": True, "type": "string"},
    "lat": {"required": True, "type": "float", "min": -90, "max": 90},
    "lng": {"required": True, "type": "float", "min": -180, "max": 180},
    "radius": {"required": False, "type": "float", "min": 1, "max": 500, "default": 25},
}


@dataclass
class InventoryCreateData:
    blood_group: str
    units: int
    collection_date: str
    expiry_date: str
    source: str
    remarks: Optional[str] = None


@dataclass
class InventoryUpdateData:
    units: Optional[int] = None
    reserved_units: Optional[int] = None
    collection_date: Optional[str] = None
    expiry_date: Optional[str] = None
    source: Optional[str] = None
    remarks: Optional[str] = None


@dataclass
class EmergencyStatusData:
    status: str


@dataclass
class EmergencySearchParams:
    blood_group: str
    lat: float
    lng: float
    radius_km: float = 25.0


def _validate(schema: dict, payload: dict) -> dict:
    validator = Validator(schema, allow_unknown=False)
    if not validator.validate(payload or {}):
        messages = []
        for field, errors in validator.errors.items():
            for err in errors:
                messages.append(f"{field}: {err}")
        raise ValueError("; ".join(messages))
    return validator.normalized(payload or {})


def validate_inventory_create(payload: dict) -> InventoryCreateData:
    data = _validate(INVENTORY_CREATE_SCHEMA, payload)
    return InventoryCreateData(
        blood_group=blood_group_from_api(data["bloodGroup"]),
        units=int(data["units"]),
        collection_date=data["collectionDate"],
        expiry_date=data["expiryDate"],
        source=data["source"].strip(),
        remarks=data.get("remarks"),
    )


def validate_inventory_update(payload: dict) -> InventoryUpdateData:
    data = _validate(INVENTORY_UPDATE_SCHEMA, payload)
    return InventoryUpdateData(
        units=int(data["units"]) if data.get("units") is not None else None,
        reserved_units=int(data["reservedUnits"]) if data.get("reservedUnits") is not None else None,
        collection_date=data.get("collectionDate"),
        expiry_date=data.get("expiryDate"),
        source=data.get("source"),
        remarks=data.get("remarks"),
    )


def validate_emergency_status(payload: dict) -> EmergencyStatusData:
    data = _validate(EMERGENCY_STATUS_SCHEMA, payload)
    status = data["status"].capitalize()
    if status not in ("Accepted", "Declined"):
        raise ValueError("status: must be Accepted or Declined")
    return EmergencyStatusData(status=status)


def validate_emergency_search_query(args: dict) -> EmergencySearchParams:
    normalized = {
        "bloodGroup": args.get("bloodGroup"),
        "lat": args.get("lat"),
        "lng": args.get("lng"),
        "radius": args.get("radius", 25),
    }
    if normalized["lat"] is not None:
        normalized["lat"] = float(normalized["lat"])
    if normalized["lng"] is not None:
        normalized["lng"] = float(normalized["lng"])
    if normalized["radius"] is not None:
        normalized["radius"] = float(normalized["radius"])

    data = _validate(EMERGENCY_SEARCH_QUERY, normalized)
    return EmergencySearchParams(
        blood_group=blood_group_from_api(data["bloodGroup"]),
        lat=float(data["lat"]),
        lng=float(data["lng"]),
        radius_km=float(data.get("radius", 25)),
    )

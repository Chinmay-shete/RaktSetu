"""Admin portal validation schemas."""

from __future__ import annotations

from dataclasses import dataclass

from cerberus import Validator


THRESHOLD_SCHEMA = {
    "minStock": {"required": True, "type": "integer", "min": 0},
    "maxStock": {"required": True, "type": "integer", "min": 1},
    "criticalUnits": {"required": True, "type": "integer", "min": 0},
    "expiryDays": {"required": True, "type": "integer", "min": 1, "max": 90},
    "emergencyAlerts": {"required": False, "type": "boolean", "default": True},
    "autoTransfer": {"required": False, "type": "boolean", "default": False},
}


@dataclass
class ThresholdUpdateData:
    min_stock: int
    max_stock: int
    critical_units: int
    expiry_days: int
    emergency_alerts: bool = True
    auto_transfer: bool = False


def validate_threshold_update(payload: dict) -> ThresholdUpdateData:
    validator = Validator(THRESHOLD_SCHEMA, allow_unknown=False)
    if not validator.validate(payload or {}):
        messages = []
        for field, errors in validator.errors.items():
            for err in errors:
                messages.append(f"{field}: {err}")
        raise ValueError("; ".join(messages))
    data = validator.normalized(payload or {})
    return ThresholdUpdateData(
        min_stock=int(data["minStock"]),
        max_stock=int(data["maxStock"]),
        critical_units=int(data["criticalUnits"]),
        expiry_days=int(data["expiryDays"]),
        emergency_alerts=bool(data.get("emergencyAlerts", True)),
        auto_transfer=bool(data.get("autoTransfer", False)),
    )

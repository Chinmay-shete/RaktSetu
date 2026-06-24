"""Hospital alert threshold configuration."""

from __future__ import annotations

from typing import Any

from flask import g

from middleware.errors import ApiError
from schemas.admin_schemas import ThresholdUpdateData
from services.db import get_connection


def _require_hospital_id() -> int:
    hospital_id = g.current_user.get("hospital_id")
    if not hospital_id:
        raise ApiError(
            "Hospital account is not linked to a facility",
            status_code=403,
            code="FORBIDDEN",
        )
    return int(hospital_id)


def _serialize_threshold(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "minStock": int(row["min_stock"]),
        "maxStock": int(row["max_stock"]),
        "criticalUnits": int(row["critical_units"]),
        "expiryDays": int(row["expiry_days"]),
        "emergencyAlerts": bool(row.get("emergency_alerts", 1)),
        "autoTransfer": bool(row.get("auto_transfer", 0)),
    }


def get_thresholds() -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM alert_thresholds WHERE hospital_id = %s",
            (hospital_id,),
        )
        row = cursor.fetchone()
        cursor.close()

    if not row:
        return {
            "thresholds": {
                "minStock": 10,
                "maxStock": 200,
                "criticalUnits": 5,
                "expiryDays": 7,
                "emergencyAlerts": True,
                "autoTransfer": False,
            }
        }

    return {"thresholds": _serialize_threshold(row)}


def update_thresholds(data: ThresholdUpdateData) -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    if data.min_stock > data.max_stock:
        raise ApiError("minStock cannot exceed maxStock", status_code=422, code="VALIDATION_ERROR")
    if data.critical_units > data.min_stock:
        raise ApiError("criticalUnits cannot exceed minStock", status_code=422, code="VALIDATION_ERROR")

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO alert_thresholds (
              hospital_id, min_stock, max_stock, critical_units, expiry_days,
              emergency_alerts, auto_transfer
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
              min_stock = VALUES(min_stock),
              max_stock = VALUES(max_stock),
              critical_units = VALUES(critical_units),
              expiry_days = VALUES(expiry_days),
              emergency_alerts = VALUES(emergency_alerts),
              auto_transfer = VALUES(auto_transfer)
            """,
            (
                hospital_id,
                data.min_stock,
                data.max_stock,
                data.critical_units,
                data.expiry_days,
                1 if data.emergency_alerts else 0,
                1 if data.auto_transfer else 0,
            ),
        )
        conn.commit()
        cursor.execute(
            "SELECT * FROM alert_thresholds WHERE hospital_id = %s",
            (hospital_id,),
        )
        row = cursor.fetchone()
        cursor.close()

    return {"thresholds": _serialize_threshold(row), "message": "Thresholds updated successfully"}

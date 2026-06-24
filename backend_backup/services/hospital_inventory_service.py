"""Hospital blood inventory CRUD and expiry alerts."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import g

from middleware.errors import ApiError
from schemas.hospital_schemas import InventoryCreateData, InventoryUpdateData
from services.audit_service import queue_audit
from services.db import get_connection
from services.donor_formatters import blood_group_to_api
from services.hospital_helpers import compute_inventory_status


def _require_hospital_id() -> int:
    hospital_id = g.current_user.get("hospital_id")
    if not hospital_id:
        raise ApiError(
            "Hospital account is not linked to a facility",
            status_code=403,
            code="FORBIDDEN",
        )
    return int(hospital_id)


def _parse_date(value: str, field: str) -> datetime.date:
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except ValueError as exc:
        raise ApiError(f"Invalid {field}. Use YYYY-MM-DD", status_code=422, code="VALIDATION_ERROR") from exc


def _serialize_batch(row: dict[str, Any]) -> dict[str, Any]:
    status, days_remaining = compute_inventory_status(
        int(row["units"]),
        int(row["reserved_units"]),
        row["expiry_date"],
    )
    return {
        "id": str(row["id"]),
        "bloodGroup": blood_group_to_api(row["blood_group"]),
        "units": int(row["units"]),
        "reservedUnits": int(row["reserved_units"]),
        "collectionDate": row["collection_date"].isoformat(),
        "expiryDate": row["expiry_date"].isoformat(),
        "source": row["source"] or "",
        "remarks": row.get("remarks") or "",
        "status": status,
        "daysRemaining": days_remaining,
    }


def _create_hospital_notification(hospital_id: int, title: str, message: str, ntype: str) -> None:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO notifications (hospital_id, title, message, type)
            VALUES (%s, %s, %s, %s)
            """,
            (hospital_id, title, message, ntype),
        )
        conn.commit()
        cursor.close()


def list_inventory(page: int = 1, per_page: int = 20) -> dict[str, Any]:
    hospital_id = _require_hospital_id()
    page = max(1, page)
    per_page = min(max(1, per_page), 100)
    offset = (page - 1) * per_page

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT COUNT(*) AS total FROM blood_batches WHERE hospital_id = %s",
            (hospital_id,),
        )
        total = int(cursor.fetchone()["total"])

        cursor.execute(
            """
            SELECT id, blood_group, units, reserved_units, collection_date,
                   expiry_date, source, remarks
            FROM blood_batches
            WHERE hospital_id = %s
            ORDER BY expiry_date ASC, id DESC
            LIMIT %s OFFSET %s
            """,
            (hospital_id, per_page, offset),
        )
        rows = cursor.fetchall()
        cursor.close()

    items = [_serialize_batch(row) for row in rows]
    total_pages = max(1, (total + per_page - 1) // per_page)

    return {
        "items": items,
        "total": total,
        "page": page,
        "perPage": per_page,
        "totalPages": total_pages,
    }


def create_inventory(data: InventoryCreateData) -> dict[str, Any]:
    hospital_id = _require_hospital_id()
    collection_date = _parse_date(data.collection_date, "collectionDate")
    expiry_date = _parse_date(data.expiry_date, "expiryDate")

    if expiry_date <= collection_date:
        raise ApiError("expiryDate must be after collectionDate", status_code=422, code="VALIDATION_ERROR")

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO blood_batches (
              hospital_id, blood_group, units, reserved_units,
              collection_date, expiry_date, source, remarks
            )
            VALUES (%s, %s, %s, 0, %s, %s, %s, %s)
            """,
            (
                hospital_id,
                data.blood_group,
                data.units,
                collection_date,
                expiry_date,
                data.source,
                data.remarks,
            ),
        )
        batch_id = cursor.lastrowid
        conn.commit()
        cursor.execute(
            """
            SELECT id, blood_group, units, reserved_units, collection_date,
                   expiry_date, source, remarks
            FROM blood_batches WHERE id = %s
            """,
            (batch_id,),
        )
        row = cursor.fetchone()
        cursor.close()

    _create_hospital_notification(
        hospital_id,
        "Stock Added Successfully",
        f"{data.units} units of {blood_group_to_api(data.blood_group)} added to inventory.",
        "warning",
    )

    return _serialize_batch(row)


def update_inventory(batch_id: int, data: InventoryUpdateData) -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM blood_batches WHERE id = %s AND hospital_id = %s",
            (batch_id, hospital_id),
        )
        existing = cursor.fetchone()
        if not existing:
            raise ApiError("Inventory batch not found", status_code=404, code="NOT_FOUND")

        units = data.units if data.units is not None else int(existing["units"])
        reserved = (
            data.reserved_units if data.reserved_units is not None else int(existing["reserved_units"])
        )
        if reserved > units:
            raise ApiError("reservedUnits cannot exceed units", status_code=422, code="VALIDATION_ERROR")

        collection_date = (
            _parse_date(data.collection_date, "collectionDate")
            if data.collection_date
            else existing["collection_date"]
        )
        expiry_date = (
            _parse_date(data.expiry_date, "expiryDate") if data.expiry_date else existing["expiry_date"]
        )
        source = data.source if data.source is not None else existing["source"]
        remarks = data.remarks if data.remarks is not None else existing["remarks"]

        cursor.execute(
            """
            UPDATE blood_batches
            SET units = %s, reserved_units = %s, collection_date = %s,
                expiry_date = %s, source = %s, remarks = %s
            WHERE id = %s AND hospital_id = %s
            """,
            (units, reserved, collection_date, expiry_date, source, remarks, batch_id, hospital_id),
        )
        conn.commit()
        cursor.execute(
            """
            SELECT id, blood_group, units, reserved_units, collection_date,
                   expiry_date, source, remarks
            FROM blood_batches WHERE id = %s
            """,
            (batch_id,),
        )
        row = cursor.fetchone()
        cursor.close()

    old_snapshot = _serialize_batch(existing)
    new_snapshot = _serialize_batch(row)
    queue_audit(
        table_name="blood_batches",
        record_id=batch_id,
        action="update",
        old_value=old_snapshot,
        new_value=new_snapshot,
    )

    return new_snapshot


def delete_inventory(batch_id: int) -> dict[str, str]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM blood_batches WHERE id = %s AND hospital_id = %s",
            (batch_id, hospital_id),
        )
        existing = cursor.fetchone()
        if not existing:
            raise ApiError("Inventory batch not found", status_code=404, code="NOT_FOUND")

        old_snapshot = _serialize_batch(existing)

        cursor.execute(
            "DELETE FROM blood_batches WHERE id = %s AND hospital_id = %s",
            (batch_id, hospital_id),
        )
        conn.commit()
        cursor.close()

    queue_audit(
        table_name="blood_batches",
        record_id=batch_id,
        action="delete",
        old_value=old_snapshot,
        severity="warning",
    )

    _create_hospital_notification(
        hospital_id,
        "Stock Batch Removed",
        f"Batch containing {blood_group_to_api(existing['blood_group'])} was manually removed.",
        "warning",
    )

    return {"message": "Inventory batch deleted successfully"}


def list_expiry_alerts() -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, blood_group, units, reserved_units, collection_date,
                   expiry_date, source, remarks
            FROM blood_batches
            WHERE hospital_id = %s
            ORDER BY expiry_date ASC
            """,
            (hospital_id,),
        )
        rows = cursor.fetchall()
        cursor.close()

    alerts = [
        _serialize_batch(row)
        for row in rows
        if _serialize_batch(row)["status"] in ("Expired", "Expiring Soon")
    ]
    alerts.sort(key=lambda item: item["daysRemaining"])

    return {"alerts": alerts, "count": len(alerts)}

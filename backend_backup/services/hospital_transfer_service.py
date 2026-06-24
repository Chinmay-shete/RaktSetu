"""Hospital-to-hospital transfer requests."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from flask import g

from middleware.errors import ApiError
from schemas.hospital_schemas import TransferCreateData, TransferStatusData
from services.audit_service import queue_audit
from services.db import get_connection
from services.donor_formatters import blood_group_to_api


PRIORITY_TO_API = {
    "critical": "Critical",
    "high": "High",
    "normal": "Medium",
    "low": "Low",
}

PRIORITY_FROM_API = {
    "critical": "critical",
    "high": "high",
    "medium": "normal",
    "low": "low",
}

STATUS_TO_API = {
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected",
    "cancelled": "Rejected",
    "in_transit": "Approved",
    "completed": "Approved",
}


def _require_hospital_id() -> int:
    hospital_id = g.current_user.get("hospital_id")
    if not hospital_id:
        raise ApiError(
            "Hospital account is not linked to a facility",
            status_code=403,
            code="FORBIDDEN",
        )
    return int(hospital_id)


def _serialize_transfer(row: dict[str, Any], current_hospital_id: int) -> dict[str, Any]:
    is_outgoing = int(row["from_hospital"]) == current_hospital_id
    if is_outgoing:
        counterparty = row["to_hospital_name"]
        transfer_type = "Outgoing"
    else:
        counterparty = row["from_hospital_name"]
        transfer_type = "Incoming"

    return {
        "id": str(row["id"]),
        "hospitalName": counterparty,
        "bloodGroup": blood_group_to_api(row["blood_group"]),
        "unitsRequired": int(row["units"]),
        "distance": round(float(row.get("distance_km") or 0), 1),
        "priority": PRIORITY_TO_API.get(row["priority"], row["priority"]),
        "status": STATUS_TO_API.get(row["status"], row["status"]),
        "message": row.get("message") or "",
        "date": row["created_at"].date().isoformat() if row.get("created_at") else None,
        "type": transfer_type,
    }


def list_transfers() -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
              tr.*,
              hf.name AS from_hospital_name,
              ht.name AS to_hospital_name,
              ST_Distance_Sphere(hf.location, ht.location) / 1000 AS distance_km
            FROM transfer_requests tr
            INNER JOIN hospitals hf ON hf.id = tr.from_hospital
            INNER JOIN hospitals ht ON ht.id = tr.to_hospital
            WHERE tr.from_hospital = %s OR tr.to_hospital = %s
            ORDER BY tr.created_at DESC
            """,
            (hospital_id, hospital_id),
        )
        rows = cursor.fetchall()
        cursor.close()

    transfers = [_serialize_transfer(row, hospital_id) for row in rows]
    return {"transfers": transfers}


def create_transfer(data: TransferCreateData, idempotency_key: str) -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    if hospital_id == data.to_hospital_id:
        raise ApiError("Cannot create a transfer to the same hospital", status_code=400, code="INVALID_OPERATION")

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT transfer_id FROM transfer_idempotency
            WHERE hospital_id = %s AND idempotency_key = %s
            """,
            (hospital_id, idempotency_key),
        )
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                """
                SELECT tr.*, hf.name AS from_hospital_name, ht.name AS to_hospital_name,
                       ST_Distance_Sphere(hf.location, ht.location) / 1000 AS distance_km
                FROM transfer_requests tr
                INNER JOIN hospitals hf ON hf.id = tr.from_hospital
                INNER JOIN hospitals ht ON ht.id = tr.to_hospital
                WHERE tr.id = %s
                """,
                (existing["transfer_id"],),
            )
            row = cursor.fetchone()
            cursor.close()
            return _serialize_transfer(row, hospital_id)

        cursor.execute("SELECT id FROM hospitals WHERE id = %s", (data.to_hospital_id,))
        if not cursor.fetchone():
            raise ApiError("Destination hospital not found", status_code=404, code="NOT_FOUND")

        cursor.execute(
            """
            INSERT INTO transfer_requests (
              from_hospital, to_hospital, blood_group, units, status, priority, message
            )
            VALUES (%s, %s, %s, %s, 'pending', %s, %s)
            """,
            (
                hospital_id,
                data.to_hospital_id,
                data.blood_group,
                data.units,
                data.priority,
                data.message,
            ),
        )
        transfer_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO transfer_idempotency (hospital_id, idempotency_key, transfer_id)
            VALUES (%s, %s, %s)
            """,
            (hospital_id, idempotency_key, transfer_id),
        )

        cursor.execute(
            """
            INSERT INTO notifications (hospital_id, title, message, type)
            VALUES (%s, %s, %s, 'transfer')
            """,
            (
                data.to_hospital_id,
                "Incoming Transfer Request",
                f"Transfer request for {data.units} units of {blood_group_to_api(data.blood_group)}.",
            ),
        )

        conn.commit()

        cursor.execute(
            """
            SELECT tr.*, hf.name AS from_hospital_name, ht.name AS to_hospital_name,
                   ST_Distance_Sphere(hf.location, ht.location) / 1000 AS distance_km
            FROM transfer_requests tr
            INNER JOIN hospitals hf ON hf.id = tr.from_hospital
            INNER JOIN hospitals ht ON ht.id = tr.to_hospital
            WHERE tr.id = %s
            """,
            (transfer_id,),
        )
        row = cursor.fetchone()
        cursor.close()

    queue_audit(
        table_name="transfer_requests",
        record_id=transfer_id,
        action="create",
        new_value=_serialize_transfer(row, hospital_id),
    )

    return _serialize_transfer(row, hospital_id)


def update_transfer_status(transfer_id: int, data: TransferStatusData) -> dict[str, Any]:
    hospital_id = _require_hospital_id()
    normalized = data.status.lower()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT tr.*, hf.name AS from_hospital_name, ht.name AS to_hospital_name,
                   ST_Distance_Sphere(hf.location, ht.location) / 1000 AS distance_km
            FROM transfer_requests tr
            INNER JOIN hospitals hf ON hf.id = tr.from_hospital
            INNER JOIN hospitals ht ON ht.id = tr.to_hospital
            WHERE tr.id = %s
            """,
            (transfer_id,),
        )
        transfer = cursor.fetchone()
        if not transfer:
            raise ApiError("Transfer request not found", status_code=404, code="NOT_FOUND")

        if transfer["status"] != "pending":
            raise ApiError("Transfer request is no longer pending", status_code=400, code="TRANSFER_CLOSED")

        source_hospital_id = int(transfer["from_hospital"])
        if hospital_id != source_hospital_id:
            raise ApiError(
                "Only the source hospital can approve or reject this transfer",
                status_code=403,
                code="FORBIDDEN",
            )

        old_snapshot = _serialize_transfer(transfer, hospital_id)

        if normalized == "approved":
            units_needed = int(transfer["units"])
            cursor.execute(
                """
                SELECT id, units, reserved_units
                FROM blood_batches
                WHERE hospital_id = %s
                  AND blood_group = %s
                  AND expiry_date >= CURDATE()
                  AND (units - reserved_units) >= %s
                ORDER BY expiry_date ASC
                LIMIT 1
                """,
                (source_hospital_id, transfer["blood_group"], units_needed),
            )
            batch = cursor.fetchone()
            if not batch:
                raise ApiError(
                    "Insufficient available stock to approve transfer",
                    status_code=400,
                    code="INSUFFICIENT_STOCK",
                )

            new_reserved = int(batch["reserved_units"]) + units_needed
            cursor.execute(
                """
                UPDATE blood_batches
                SET reserved_units = %s
                WHERE id = %s
                """,
                (new_reserved, batch["id"]),
            )
            cursor.execute(
                """
                UPDATE transfer_requests
                SET status = 'approved', source_batch_id = %s
                WHERE id = %s
                """,
                (batch["id"], transfer_id),
            )

            queue_audit(
                table_name="blood_batches",
                record_id=batch["id"],
                action="update",
                old_value={
                    "reservedUnits": int(batch["reserved_units"]),
                    "units": int(batch["units"]),
                },
                new_value={
                    "reservedUnits": new_reserved,
                    "units": int(batch["units"]),
                    "reason": "transfer_approved",
                    "transferId": transfer_id,
                },
            )
        else:
            cursor.execute(
                "UPDATE transfer_requests SET status = 'rejected' WHERE id = %s",
                (transfer_id,),
            )

        conn.commit()

        cursor.execute(
            """
            SELECT tr.*, hf.name AS from_hospital_name, ht.name AS to_hospital_name,
                   ST_Distance_Sphere(hf.location, ht.location) / 1000 AS distance_km
            FROM transfer_requests tr
            INNER JOIN hospitals hf ON hf.id = tr.from_hospital
            INNER JOIN hospitals ht ON ht.id = tr.to_hospital
            WHERE tr.id = %s
            """,
            (transfer_id,),
        )
        updated = cursor.fetchone()
        cursor.close()

    new_snapshot = _serialize_transfer(updated, hospital_id)
    queue_audit(
        table_name="transfer_requests",
        record_id=transfer_id,
        action="update",
        old_value=old_snapshot,
        new_value=new_snapshot,
        severity="warning" if normalized == "approved" else "info",
    )

    return new_snapshot

"""Hospital notification endpoints."""

from __future__ import annotations

from typing import Any

from flask import g

from middleware.errors import ApiError
from services.db import get_connection
from services.hospital_helpers import epoch_ms


def _require_hospital_id() -> int:
    hospital_id = g.current_user.get("hospital_id")
    if not hospital_id:
        raise ApiError(
            "Hospital account is not linked to a facility",
            status_code=403,
            code="FORBIDDEN",
        )
    return int(hospital_id)


def _map_notification_type(db_type: str) -> str:
    mapping = {
        "emergency": "Emergency",
        "transfer": "Transfer",
        "warning": "Stock Low",
        "critical": "Stock Low",
        "info": "Stock Low",
        "camp": "Transfer",
        "system": "Stock Low",
    }
    if db_type in mapping:
        return mapping[db_type]
    return db_type.replace("_", " ").title()


def _serialize_notification(row: dict[str, Any]) -> dict[str, Any]:
    ntype = row["type"]
    if "expiry" in row["title"].lower() or "expir" in row["message"].lower():
        display_type = "Expiry"
    else:
        display_type = _map_notification_type(ntype)

    return {
        "id": str(row["id"]),
        "title": row["title"],
        "message": row["message"],
        "type": display_type,
        "read": bool(row["is_read"]),
        "timestamp": epoch_ms(row["timestamp"]),
    }


def list_notifications() -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, title, message, type, is_read, timestamp
            FROM notifications
            WHERE hospital_id = %s
            ORDER BY timestamp DESC
            LIMIT 100
            """,
            (hospital_id,),
        )
        rows = cursor.fetchall()
        cursor.close()

    notifications = [_serialize_notification(row) for row in rows]
    unread = sum(1 for n in notifications if not n["read"])

    return {"notifications": notifications, "unreadCount": unread}


def mark_notification_read(notification_id: int) -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            UPDATE notifications
            SET is_read = 1
            WHERE id = %s AND hospital_id = %s
            """,
            (notification_id, hospital_id),
        )
        if cursor.rowcount == 0:
            raise ApiError("Notification not found", status_code=404, code="NOT_FOUND")
        conn.commit()
        cursor.execute(
            """
            SELECT id, title, message, type, is_read, timestamp
            FROM notifications WHERE id = %s
            """,
            (notification_id,),
        )
        row = cursor.fetchone()
        cursor.close()

    return {"notification": _serialize_notification(row)}


def mark_all_notifications_read() -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE notifications SET is_read = 1 WHERE hospital_id = %s AND is_read = 0",
            (hospital_id,),
        )
        updated = cursor.rowcount
        conn.commit()
        cursor.close()

    return {"message": "All notifications marked as read", "updated": updated}

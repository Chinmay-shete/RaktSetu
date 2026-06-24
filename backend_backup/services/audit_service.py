"""Audit log queue flushed at end of each request."""

from __future__ import annotations

import json
from typing import Any

from flask import g, has_request_context, request

from services.db import get_connection


def _actor_id() -> int | None:
    if has_request_context() and hasattr(g, "current_user") and g.current_user:
        return g.current_user.get("id")
    return None


def _client_ip() -> str | None:
    if not has_request_context():
        return None
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr


def queue_audit(
    *,
    table_name: str,
    record_id: int | str,
    action: str,
    old_value: dict[str, Any] | None = None,
    new_value: dict[str, Any] | None = None,
    severity: str = "info",
) -> None:
    if not has_request_context():
        return

    if not hasattr(g, "audit_events"):
        g.audit_events = []

    g.audit_events.append(
        {
            "table_name": table_name,
            "record_id": str(record_id),
            "action": action,
            "old_value": old_value,
            "new_value": new_value,
            "severity": severity,
        }
    )


def flush_audit_logs() -> None:
    if not has_request_context() or not getattr(g, "audit_events", None):
        return

    actor_id = _actor_id()
    ip_address = _client_ip()

    with get_connection() as conn:
        cursor = conn.cursor()
        for event in g.audit_events:
            cursor.execute(
                """
                INSERT INTO audit_logs (actor_id, action, severity, ip_address)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    actor_id,
                    _format_action(event),
                    event.get("severity", "info"),
                    ip_address,
                ),
            )
        conn.commit()
        cursor.close()

    g.audit_events = []


def _format_action(event: dict[str, Any]) -> str:
    table = event["table_name"]
    record_id = event["record_id"]
    action = event["action"]
    payload = {
        "table": table,
        "recordId": record_id,
        "action": action,
        "old": event.get("old_value"),
        "new": event.get("new_value"),
    }
    return json.dumps(payload, default=str)

"""Admin forecast gateway and waste analytics."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

import json
import urllib.error
import urllib.request

from flask import g

from config.settings import get_settings
from middleware.errors import ApiError
from services.cache_service import cache_get, cache_set
from services.db import get_connection
from services.donor_formatters import blood_group_to_api

BLOOD_GROUPS = ["O+", "A+", "B+", "O-", "A-", "B-", "AB+", "AB-"]
DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
FORECAST_CACHE_TTL = 24 * 60 * 60


def _require_hospital_id() -> int:
    hospital_id = g.current_user.get("hospital_id")
    if not hospital_id:
        raise ApiError(
            "Hospital account is not linked to a facility",
            status_code=403,
            code="FORBIDDEN",
        )
    return int(hospital_id)


def _call_ai_service(hospital_id: int) -> dict[str, Any] | None:
    settings = get_settings()
    if not settings.ai_service_url:
        return None

    url = f"{settings.ai_service_url.rstrip('/')}/predict?hospital_id={hospital_id}&days=7"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=settings.ai_service_timeout) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError):
        return None


def _baseline_forecast(hospital_id: int) -> list[dict[str, Any]]:
    """Generate 7-day forecast from recent usage patterns when AI service is unavailable."""
    usage_by_group: dict[str, float] = {group: 0.0 for group in BLOOD_GROUPS}

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT blood_group, COALESCE(SUM(units), 0) AS total_units
            FROM blood_batches
            WHERE hospital_id = %s
              AND collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY blood_group
            """,
            (hospital_id,),
        )
        for row in cursor.fetchall():
            usage_by_group[row["blood_group"]] = float(row["total_units"]) / 30.0

        cursor.execute(
            """
            SELECT blood_group, COALESCE(SUM(units), 0) AS transfer_units
            FROM transfer_requests
            WHERE from_hospital = %s
              AND status IN ('approved', 'completed', 'in_transit')
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY blood_group
            """,
            (hospital_id,),
        )
        for row in cursor.fetchall():
            usage_by_group[row["blood_group"]] += float(row["transfer_units"]) / 30.0

        cursor.close()

    series: list[dict[str, Any]] = []
    today = date.today()
    for offset in range(7):
        day = today + timedelta(days=offset)
        day_label = DAY_LABELS[day.weekday()]
        entry: dict[str, Any] = {"day": day_label, "date": day.isoformat()}
        weekend_factor = 1.15 if day.weekday() >= 5 else 1.0
        for group in BLOOD_GROUPS:
            base = max(usage_by_group.get(group, 0), 1.0)
            entry[blood_group_to_api(group) or group] = round(base * weekend_factor * 7, 0)
        series.append(entry)

    return series


def get_forecast() -> dict[str, Any]:
    hospital_id = _require_hospital_id()
    cache_key = f"forecast:hospital:{hospital_id}:7d"

    cached = cache_get(cache_key)
    if cached:
        cached["cached"] = True
        return cached

    ai_payload = _call_ai_service(hospital_id)
    if ai_payload and ai_payload.get("series"):
        result = {
            "timeframe": "7days",
            "series": ai_payload["series"],
            "model": ai_payload.get("model", "prophet"),
            "cached": False,
        }
    else:
        result = {
            "timeframe": "7days",
            "series": _baseline_forecast(hospital_id),
            "model": "baseline",
            "cached": False,
        }

    cache_set(cache_key, result, FORECAST_CACHE_TTL)
    return result


def get_waste_analytics() -> dict[str, Any]:
    hospital_id = _require_hospital_id()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT blood_group,
                   SUM(CASE WHEN expiry_date < CURDATE() THEN units ELSE 0 END) AS expired_units,
                   SUM(CASE WHEN expiry_date >= CURDATE() THEN units ELSE 0 END) AS active_units,
                   SUM(units) AS total_units
            FROM blood_batches
            WHERE hospital_id = %s
            GROUP BY blood_group
            """,
            (hospital_id,),
        )
        by_group = cursor.fetchall()

        cursor.execute(
            """
            SELECT
              DATE_FORMAT(expiry_date, '%Y-%m') AS month_key,
              SUM(CASE WHEN expiry_date < CURDATE() THEN units ELSE 0 END) AS expired,
              SUM(CASE WHEN expiry_date >= CURDATE() AND collection_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY) THEN units ELSE 0 END) AS used
            FROM blood_batches
            WHERE hospital_id = %s
              AND expiry_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(expiry_date, '%Y-%m')
            ORDER BY month_key ASC
            LIMIT 6
            """,
            (hospital_id,),
        )
        trend_rows = cursor.fetchall()
        cursor.close()

    waste_by_group = []
    total_expired = 0
    total_active = 0
    for row in by_group:
        expired = int(row["expired_units"] or 0)
        active = int(row["active_units"] or 0)
        total = int(row["total_units"] or 0)
        total_expired += expired
        total_active += active
        waste_by_group.append(
            {
                "bloodGroup": blood_group_to_api(row["blood_group"]),
                "expiredUnits": expired,
                "activeUnits": active,
                "totalUnits": total,
                "wasteRate": round((expired / total) * 100, 1) if total else 0,
            }
        )

    waste_trend = [
        {
            "month": row["month_key"],
            "expired": int(row["expired"] or 0),
            "used": int(row["used"] or 0),
        }
        for row in trend_rows
    ]

    total_units = total_expired + total_active
    return {
        "wasteByGroup": waste_by_group,
        "wasteTrend": waste_trend,
        "summary": {
            "totalExpiredUnits": total_expired,
            "totalActiveUnits": total_active,
            "overallWasteRate": round((total_expired / total_units) * 100, 1) if total_units else 0,
        },
    }

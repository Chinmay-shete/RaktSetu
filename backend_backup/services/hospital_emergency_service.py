"""Hospital emergency dispatch and geospatial stock search."""

from __future__ import annotations

from typing import Any

from flask import g

from middleware.errors import ApiError
from schemas.hospital_schemas import EmergencySearchParams, EmergencyStatusData
from services.db import get_connection
from services.donor_formatters import blood_group_to_api
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


def _get_hospital_location(hospital_id: int) -> tuple[float, float]:
    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT lat, lng FROM hospitals WHERE id = %s", (hospital_id,))
        row = cursor.fetchone()
        cursor.close()
    if not row:
        raise ApiError("Hospital not found", status_code=404, code="NOT_FOUND")
    return float(row["lat"]), float(row["lng"])


def list_hospital_emergencies() -> dict[str, Any]:
    """Incoming SOS requests this hospital can respond to."""
    hospital_id = _require_hospital_id()
    lat, lng = _get_hospital_location(hospital_id)
    max_distance_m = 100000  # 100 km search radius for dispatch queue

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
              er.id,
              er.blood_group,
              er.units,
              er.message,
              er.target_timestamp,
              er.status AS emergency_status,
              h.name AS hospital_name,
              ST_Distance_Sphere(
                ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
                er.location
              ) AS distance_m,
              resp.status AS response_status
            FROM emergency_requests er
            INNER JOIN hospitals h ON h.id = er.hospital_id
            LEFT JOIN emergency_responses resp
              ON resp.emergency_id = er.id AND resp.hospital_id = %s
            WHERE er.hospital_id <> %s
              AND er.status IN ('open', 'matched')
              AND ST_Distance_Sphere(
                ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
                er.location
              ) <= %s
              AND resp.id IS NULL
            ORDER BY er.target_timestamp ASC
            """,
            (lng, lat, hospital_id, hospital_id, lng, lat, max_distance_m),
        )
        rows = cursor.fetchall()
        cursor.close()

    emergencies = []
    for row in rows:
        emergencies.append(
            {
                "id": str(row["id"]),
                "hospitalName": row["hospital_name"],
                "bloodGroup": blood_group_to_api(row["blood_group"]),
                "unitsRequired": int(row["units"]),
                "distance": round(float(row["distance_m"]) / 1000, 1),
                "status": "Pending",
                "targetTimestamp": epoch_ms(row["target_timestamp"]),
                "message": row["message"] or "",
            }
        )

    return {"emergencies": emergencies}


def update_emergency_status(emergency_id: int, data: EmergencyStatusData) -> dict[str, Any]:
    hospital_id = _require_hospital_id()
    normalized_status = data.status.lower()

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT er.id, er.blood_group, er.units, er.status, er.hospital_id,
                   h.name AS hospital_name
            FROM emergency_requests er
            INNER JOIN hospitals h ON h.id = er.hospital_id
            WHERE er.id = %s
            """,
            (emergency_id,),
        )
        emergency = cursor.fetchone()
        if not emergency:
            raise ApiError("Emergency request not found", status_code=404, code="NOT_FOUND")

        if emergency["hospital_id"] == hospital_id:
            raise ApiError("Cannot respond to your own emergency request", status_code=400, code="INVALID_OPERATION")

        if emergency["status"] not in ("open", "matched"):
            raise ApiError("Emergency request is no longer active", status_code=400, code="EMERGENCY_CLOSED")

        cursor.execute(
            """
            SELECT id, status FROM emergency_responses
            WHERE emergency_id = %s AND hospital_id = %s
            """,
            (emergency_id, hospital_id),
        )
        existing_response = cursor.fetchone()
        if existing_response and existing_response["status"] == "accepted":
            raise ApiError("Emergency already accepted by this hospital", status_code=409, code="ALREADY_ACCEPTED")

        if normalized_status == "accepted":
            units_needed = int(emergency["units"])
            cursor.execute(
                """
                SELECT id, units, reserved_units
                FROM blood_batches
                WHERE hospital_id = %s
                  AND blood_group = %s
                  AND units >= %s
                  AND expiry_date >= CURDATE()
                ORDER BY expiry_date ASC
                LIMIT 1
                """,
                (hospital_id, emergency["blood_group"], units_needed),
            )
            batch = cursor.fetchone()
            if not batch:
                raise ApiError(
                    "Insufficient matching blood stock to dispatch",
                    status_code=400,
                    code="INSUFFICIENT_STOCK",
                )

            new_units = int(batch["units"]) - units_needed
            cursor.execute(
                "UPDATE blood_batches SET units = %s WHERE id = %s",
                (new_units, batch["id"]),
            )
            cursor.execute(
                "UPDATE emergency_requests SET status = 'matched' WHERE id = %s",
                (emergency_id,),
            )

        if existing_response:
            cursor.execute(
                """
                UPDATE emergency_responses
                SET status = %s, created_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (normalized_status, existing_response["id"]),
            )
        else:
            cursor.execute(
                """
                INSERT INTO emergency_responses (emergency_id, hospital_id, status)
                VALUES (%s, %s, %s)
                """,
                (emergency_id, hospital_id, normalized_status),
            )

        if normalized_status == "accepted":
            cursor.execute(
                """
                INSERT INTO notifications (hospital_id, title, message, type)
                VALUES (%s, %s, %s, 'emergency')
                """,
                (
                    hospital_id,
                    "Emergency Dispatch Authorized",
                    f"Dispatched {emergency['units']} units of {blood_group_to_api(emergency['blood_group'])} to {emergency['hospital_name']}.",
                ),
            )

        conn.commit()
        cursor.close()

    return {
        "id": str(emergency_id),
        "hospitalName": emergency["hospital_name"],
        "bloodGroup": blood_group_to_api(emergency["blood_group"]),
        "unitsRequired": int(emergency["units"]),
        "status": data.status,
        "message": emergency.get("message") or "",
    }


def search_emergency_stock(params: EmergencySearchParams) -> dict[str, Any]:
    """Live geospatial search — nearest hospitals with available matching stock."""
    radius_m = params.radius_km * 1000

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
              h.id AS hospital_id,
              h.name AS hospital_name,
              h.contact,
              h.address,
              SUM(bb.units - bb.reserved_units) AS available_units,
              ST_Distance_Sphere(
                ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
                h.location
              ) AS distance_m
            FROM hospitals h
            INNER JOIN blood_batches bb ON bb.hospital_id = h.id
            WHERE bb.blood_group = %s
              AND bb.expiry_date >= CURDATE()
              AND (bb.units - bb.reserved_units) > 0
              AND h.verification_status = 'verified'
              AND ST_Distance_Sphere(
                ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
                h.location
              ) <= %s
            GROUP BY h.id, h.name, h.contact, h.address, h.location
            HAVING available_units > 0
            ORDER BY distance_m ASC
            LIMIT 25
            """,
            (
                params.lng,
                params.lat,
                params.blood_group,
                params.lng,
                params.lat,
                radius_m,
            ),
        )
        rows = cursor.fetchall()
        cursor.close()

    results = [
        {
            "hospitalId": row["hospital_id"],
            "hospitalName": row["hospital_name"],
            "bloodGroup": blood_group_to_api(params.blood_group),
            "availableUnits": int(row["available_units"]),
            "distanceKm": round(float(row["distance_m"]) / 1000, 2),
            "contact": row.get("contact"),
            "address": row.get("address"),
        }
        for row in rows
    ]

    return {
        "results": results,
        "bloodGroup": blood_group_to_api(params.blood_group),
        "radiusKm": params.radius_km,
        "count": len(results),
    }

"""Donor portal business logic."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from flask import g
import mysql.connector
from mysql.connector import errorcode

from middleware.errors import ApiError
from schemas.donor_schemas import LocationData, PledgeData, ProfileCreateData, ProfileUpdateData
from services.db import get_connection
from services.donor_formatters import (
    blood_group_to_api,
    DONATION_TYPE_TO_API,
    gender_to_api,
)


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except ValueError:
        raise ApiError("Invalid date format. Use YYYY-MM-DD", status_code=422, code="VALIDATION_ERROR")


def _get_donor_by_user_id(user_id: int) -> dict[str, Any] | None:
    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT d.*, u.email, u.phone
            FROM donors d
            INNER JOIN users u ON u.id = d.user_id
            WHERE d.user_id = %s
            """,
            (user_id,),
        )
        row = cursor.fetchone()
        cursor.close()
        return row


def _serialize_profile(donor: dict[str, Any]) -> dict[str, Any]:
    chronic = donor.get("chronic_illness")
    has_illness = bool(chronic and str(chronic).strip())

    return {
        "id": donor["id"],
        "donorCode": donor.get("donor_code"),
        "fullName": donor["full_name"],
        "age": donor["age"],
        "gender": gender_to_api(donor["gender"]),
        "city": donor["city"],
        "pincode": donor["pincode"],
        "bloodGroup": blood_group_to_api(donor["blood_group"]),
        "weight": float(donor["weight"]) if donor.get("weight") is not None else None,
        "chronicIllness": has_illness,
        "lastDonatedDate": donor["last_donated_date"].isoformat() if donor.get("last_donated_date") else None,
        "lat": float(donor["lat"]) if donor.get("lat") is not None else None,
        "lng": float(donor["lng"]) if donor.get("lng") is not None else None,
        "email": donor.get("email"),
        "phone": donor.get("phone"),
        "availableForDonation": bool(donor.get("available_for_donation")),
        "createdAt": donor["created_at"].isoformat() if donor.get("created_at") else None,
        "updatedAt": donor["updated_at"].isoformat() if donor.get("updated_at") else None,
    }


def _generate_donor_code(donor_id: int) -> str:
    year = datetime.now().year
    return f"RS-{year}-{donor_id:04d}"


def get_profile() -> dict[str, Any]:
    user_id = g.current_user["id"]
    donor = _get_donor_by_user_id(user_id)
    if not donor:
        raise ApiError("Donor profile not found. Complete profile setup first.", status_code=404, code="PROFILE_NOT_FOUND")
    return _serialize_profile(donor)


def create_profile(data: ProfileCreateData) -> dict[str, Any]:
    user_id = g.current_user["id"]
    if g.current_user["role"] != "donor":
        raise ApiError("Only donors can create a donor profile", status_code=403, code="FORBIDDEN")

    if _get_donor_by_user_id(user_id):
        raise ApiError("Donor profile already exists", status_code=409, code="PROFILE_EXISTS")

    last_donated = _parse_date(data.last_donated_date)
    chronic_text = "Yes" if data.chronic_illness else None
    city = data.city or "Unknown"
    pincode = data.pincode or "000000"

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO donors (
              user_id, full_name, age, gender, city, pincode, blood_group,
              weight, chronic_illness, last_donated_date
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                data.full_name,
                data.age,
                data.gender,
                city,
                pincode,
                data.blood_group,
                data.weight,
                chronic_text,
                last_donated,
            ),
        )
        donor_id = cursor.lastrowid
        donor_code = _generate_donor_code(donor_id)
        cursor.execute(
            "UPDATE donors SET donor_code = %s WHERE id = %s",
            (donor_code, donor_id),
        )
        conn.commit()
        cursor.execute(
            """
            SELECT d.*, u.email, u.phone
            FROM donors d
            INNER JOIN users u ON u.id = d.user_id
            WHERE d.id = %s
            """,
            (donor_id,),
        )
        donor = cursor.fetchone()
        cursor.close()

    return _serialize_profile(donor)


def update_profile(data: ProfileUpdateData) -> dict[str, Any]:
    user_id = g.current_user["id"]
    donor = _get_donor_by_user_id(user_id)
    if not donor:
        raise ApiError("Donor profile not found", status_code=404, code="PROFILE_NOT_FOUND")

    updates: list[str] = []
    params: list[Any] = []

    if data.full_name is not None:
        updates.append("full_name = %s")
        params.append(data.full_name.strip())
    if data.age is not None:
        updates.append("age = %s")
        params.append(data.age)
    if data.gender is not None:
        updates.append("gender = %s")
        params.append(data.gender)
    if data.city is not None:
        updates.append("city = %s")
        params.append(data.city)
    if data.pincode is not None:
        updates.append("pincode = %s")
        params.append(data.pincode)
    if data.weight is not None:
        updates.append("weight = %s")
        params.append(data.weight)
    if data.chronic_illness is not None:
        updates.append("chronic_illness = %s")
        params.append("Yes" if data.chronic_illness else None)
    if data.available_for_donation is not None:
        updates.append("available_for_donation = %s")
        params.append(1 if data.available_for_donation else 0)

    if not updates:
        raise ApiError("No valid fields to update", status_code=400, code="VALIDATION_ERROR")

    params.append(donor["id"])

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            f"UPDATE donors SET {', '.join(updates)} WHERE id = %s",
            tuple(params),
        )
        conn.commit()
        cursor.execute(
            """
            SELECT d.*, u.email, u.phone
            FROM donors d
            INNER JOIN users u ON u.id = d.user_id
            WHERE d.id = %s
            """,
            (donor["id"],),
        )
        updated = cursor.fetchone()
        cursor.close()

    return _serialize_profile(updated)


def save_location(data: LocationData) -> dict[str, Any]:
    user_id = g.current_user["id"]
    donor = _get_donor_by_user_id(user_id)
    if not donor:
        raise ApiError("Donor profile not found", status_code=404, code="PROFILE_NOT_FOUND")

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            UPDATE donors
            SET lat = %s,
                lng = %s,
                location = ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
                city = COALESCE(%s, city),
                pincode = COALESCE(%s, pincode)
            WHERE id = %s
            """,
            (
                data.lat,
                data.lng,
                data.lng,
                data.lat,
                data.city,
                data.pincode,
                donor["id"],
            ),
        )
        conn.commit()
        cursor.execute(
            """
            SELECT d.*, u.email, u.phone
            FROM donors d
            INNER JOIN users u ON u.id = d.user_id
            WHERE d.id = %s
            """,
            (donor["id"],),
        )
        updated = cursor.fetchone()
        cursor.close()

    return {
        "message": "Location saved successfully",
        "profile": _serialize_profile(updated),
    }


def list_donations() -> dict[str, Any]:
    user_id = g.current_user["id"]
    donor = _get_donor_by_user_id(user_id)
    if not donor:
        raise ApiError("Donor profile not found", status_code=404, code="PROFILE_NOT_FOUND")

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, donation_date, location_name, donation_type, units, status
            FROM donations
            WHERE donor_id = %s
            ORDER BY donation_date DESC, id DESC
            """,
            (donor["id"],),
        )
        rows = cursor.fetchall()
        cursor.close()

    donations = [
        {
            "id": row["id"],
            "date": row["donation_date"].isoformat(),
            "location": row["location_name"],
            "type": DONATION_TYPE_TO_API.get(row["donation_type"], row["donation_type"]),
            "units": row["units"],
            "status": row["status"].capitalize(),
        }
        for row in rows
    ]

    return {"donations": donations}


def get_stats() -> dict[str, Any]:
    user_id = g.current_user["id"]
    donor = _get_donor_by_user_id(user_id)
    if not donor:
        raise ApiError("Donor profile not found", status_code=404, code="PROFILE_NOT_FOUND")

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT COALESCE(SUM(units), 0) AS total_units,
                   COUNT(*) AS donation_count
            FROM donations
            WHERE donor_id = %s AND status = 'completed'
            """,
            (donor["id"],),
        )
        agg = cursor.fetchone()
        cursor.close()

    total_donations = int(agg["donation_count"])
    total_units = int(agg["total_units"])
    lives_impacted = total_units * 3

    last_date = donor.get("last_donated_date")
    if not last_date and total_donations > 0:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT MAX(donation_date) AS last_date
                FROM donations
                WHERE donor_id = %s AND status = 'completed'
                """,
                (donor["id"],),
            )
            row = cursor.fetchone()
            cursor.close()
            last_date = row["last_date"] if row else None

    next_eligible = None
    is_eligible_now = True
    if last_date:
        next_eligible = last_date + timedelta(days=90)
        is_eligible_now = date.today() >= next_eligible

    return {
        "totalDonations": total_donations,
        "totalUnits": total_units,
        "livesImpacted": lives_impacted,
        "nextEligibleDate": next_eligible.isoformat() if next_eligible else None,
        "isEligibleNow": is_eligible_now,
        "lastDonatedDate": last_date.isoformat() if last_date else None,
    }


def list_urgent_requests() -> dict[str, Any]:
    user_id = g.current_user["id"]
    donor = _get_donor_by_user_id(user_id)
    if not donor:
        raise ApiError("Donor profile not found", status_code=404, code="PROFILE_NOT_FOUND")

    if donor.get("lat") is None or donor.get("lng") is None:
        raise ApiError(
            "Set your location before viewing urgent requests",
            status_code=400,
            code="LOCATION_REQUIRED",
        )

    radius_m = 10000

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
              er.id,
              er.blood_group,
              er.units,
              er.status,
              er.message,
              er.target_timestamp,
              er.lat,
              er.lng,
              h.name AS hospital_name,
              ST_Distance_Sphere(
                ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
                er.location
              ) AS distance_m
            FROM emergency_requests er
            INNER JOIN hospitals h ON h.id = er.hospital_id
            WHERE er.status IN ('open', 'matched')
              AND ST_Distance_Sphere(
                ST_GeomFromText(CONCAT('POINT(', %s, ' ', %s, ')'), 4326),
                er.location
              ) <= %s
            ORDER BY distance_m ASC, er.target_timestamp ASC
            """,
            (
                donor["lng"],
                donor["lat"],
                donor["lng"],
                donor["lat"],
                radius_m,
            ),
        )
        emergencies = cursor.fetchall()

        results = []
        for row in emergencies:
            cursor.execute(
                """
                SELECT COUNT(*) AS pledge_count
                FROM emergency_pledges
                WHERE emergency_id = %s AND status IN ('pledged', 'completed')
                """,
                (row["id"],),
            )
            pledge_row = cursor.fetchone()
            pledge_count = int(pledge_row["pledge_count"])
            units_needed = int(row["units"])
            progress = min(100, round((pledge_count / units_needed) * 100) if units_needed else 0)

            urgency = "Moderate Need"
            if progress < 50 or units_needed >= 5:
                urgency = "Critical Shortage"

            results.append(
                {
                    "id": row["id"],
                    "hospitalName": row["hospital_name"],
                    "bloodGroup": blood_group_to_api(row["blood_group"]),
                    "unitsNeeded": units_needed,
                    "status": row["status"],
                    "message": row["message"],
                    "targetTimestamp": row["target_timestamp"].isoformat() if row["target_timestamp"] else None,
                    "distanceKm": round(float(row["distance_m"]) / 1000, 1),
                    "fulfillmentProgress": progress,
                    "urgencyLabel": urgency,
                    "lat": float(row["lat"]),
                    "lng": float(row["lng"]),
                }
            )

        cursor.close()

    return {"requests": results, "radiusKm": radius_m / 1000}


def pledge_emergency(data: PledgeData) -> dict[str, Any]:
    user_id = g.current_user["id"]
    donor = _get_donor_by_user_id(user_id)
    if not donor:
        raise ApiError("Donor profile not found", status_code=404, code="PROFILE_NOT_FOUND")

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, status, blood_group, units
            FROM emergency_requests
            WHERE id = %s
            """,
            (data.emergency_id,),
        )
        emergency = cursor.fetchone()
        if not emergency:
            raise ApiError("Emergency request not found", status_code=404, code="NOT_FOUND")

        if emergency["status"] not in ("open", "matched"):
            raise ApiError("Emergency request is no longer active", status_code=400, code="EMERGENCY_CLOSED")

        if emergency["blood_group"] != donor["blood_group"]:
            raise ApiError(
                "Your blood group does not match this emergency request",
                status_code=400,
                code="BLOOD_GROUP_MISMATCH",
            )

        cursor.execute(
            """
            SELECT id FROM emergency_pledges
            WHERE donor_id = %s AND emergency_id = %s
            """,
            (donor["id"], data.emergency_id),
        )
        if cursor.fetchone():
            raise ApiError("You have already pledged for this emergency", status_code=409, code="ALREADY_PLEDGED")

        cursor.execute(
            """
            INSERT INTO emergency_pledges (donor_id, emergency_id, status)
            VALUES (%s, %s, 'pledged')
            """,
            (donor["id"], data.emergency_id),
        )
        conn.commit()
        cursor.close()

    return {
        "message": "Pledge recorded successfully",
        "emergencyId": data.emergency_id,
        "status": "pledged",
    }


def list_camps(
    *,
    city: str | None = None,
    state: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
) -> dict[str, Any]:
    """List approved camps. Uses donor profile or query filters."""

    district_ids: list[int] = []

    if city and state:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id FROM districts WHERE name = %s AND state = %s",
                (city, state),
            )
            rows = cursor.fetchall()
            cursor.close()
            district_ids = [row["id"] for row in rows]

    if not district_ids:
        current_user = getattr(g, "current_user", None)
        if current_user:
            donor = _get_donor_by_user_id(current_user["id"])
        if donor:
            with get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute(
                    "SELECT id FROM districts WHERE name = %s LIMIT 5",
                    (donor["city"],),
                )
                rows = cursor.fetchall()
                cursor.close()
                district_ids = [row["id"] for row in rows]

    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        if district_ids:
            placeholders = ",".join(["%s"] * len(district_ids))
            cursor.execute(
                f"""
                SELECT
                  c.id, c.name, c.camp_date, c.location, c.organizer,
                  c.capacity, c.expected_donors, c.status,
                  d.name AS district_name, d.state
                FROM donation_camps c
                INNER JOIN districts d ON d.id = c.district_id
                WHERE c.status = 'approved'
                  AND c.camp_date >= CURDATE()
                  AND c.district_id IN ({placeholders})
                ORDER BY c.camp_date ASC
                LIMIT 50
                """,
                tuple(district_ids),
            )
        else:
            cursor.execute(
                """
                SELECT
                  c.id, c.name, c.camp_date, c.location, c.organizer,
                  c.capacity, c.expected_donors, c.status,
                  d.name AS district_name, d.state
                FROM donation_camps c
                INNER JOIN districts d ON d.id = c.district_id
                WHERE c.status = 'approved'
                  AND c.camp_date >= CURDATE()
                ORDER BY c.camp_date ASC
                LIMIT 50
                """
            )
        rows = cursor.fetchall()
        cursor.close()

    camps = [
        {
            "id": row["id"],
            "name": row["name"],
            "campDate": row["camp_date"].isoformat(),
            "location": row["location"],
            "organizer": row["organizer"],
            "capacity": row["capacity"],
            "expectedDonors": row["expected_donors"],
            "status": row["status"],
            "district": row["district_name"],
            "state": row["state"],
            "type": "High Need" if row["expected_donors"] >= row["capacity"] * 0.8 else "Standard",
        }
        for row in rows
    ]

    return {"camps": camps, "filters": {"city": city, "state": state, "lat": lat, "lng": lng}}


def save_demo_request(email: str) -> dict[str, str]:
    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO demo_requests (email) VALUES (%s)",
                (email,),
            )
            conn.commit()
        except mysql.connector.Error as exc:
            if exc.errno == errorcode.ER_DUP_ENTRY:
                raise ApiError(
                    "This email has already been registered for a demo",
                    status_code=409,
                    code="EMAIL_EXISTS",
                ) from exc
            raise
        finally:
            cursor.close()

    return {"message": "Request received! We'll be in touch within 24 hours."}

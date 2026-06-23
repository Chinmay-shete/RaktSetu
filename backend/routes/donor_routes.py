from flask import Blueprint, g, jsonify, request

from controllers import donor_controller
from middleware.auth import require_auth, require_role
from middleware.validation import validate_request
from schemas.donor_schemas import (
    validate_demo_request,
    validate_location,
    validate_pledge,
    validate_profile_create,
    validate_profile_update,
)
from schemas.donor_schemas import (
    DemoRequestData,
    LocationData,
    PledgeData,
    ProfileCreateData,
    ProfileUpdateData,
)

donor_bp = Blueprint("donor", __name__)


@donor_bp.get("/profile")
@require_role("donor")
def get_profile_route():
    body, status = donor_controller.get_profile()
    return jsonify(body), status


@donor_bp.post("/profile")
@require_role("donor")
@validate_request(validate_profile_create)
def create_profile_route(data: ProfileCreateData):
    body, status = donor_controller.create_profile(data)
    return jsonify(body), status


@donor_bp.put("/profile")
@require_role("donor")
@validate_request(validate_profile_update)
def update_profile_route(data: ProfileUpdateData):
    body, status = donor_controller.update_profile(data)
    return jsonify(body), status


@donor_bp.post("/location")
@require_role("donor")
@validate_request(validate_location)
def save_location_route(data: LocationData):
    body, status = donor_controller.save_location(data)
    return jsonify(body), status


@donor_bp.get("/donations")
@require_role("donor")
def list_donations_route():
    body, status = donor_controller.list_donations()
    return jsonify(body), status


@donor_bp.get("/stats")
@require_role("donor")
def get_stats_route():
    body, status = donor_controller.get_stats()
    return jsonify(body), status


@donor_bp.get("/urgent-requests")
@require_role("donor")
def urgent_requests_route():
    body, status = donor_controller.list_urgent_requests()
    return jsonify(body), status


@donor_bp.post("/pledge")
@require_role("donor")
@validate_request(validate_pledge)
def pledge_route(data: PledgeData):
    body, status = donor_controller.pledge(data)
    return jsonify(body), status


@donor_bp.get("/camps")
def list_camps_route():
    city = request.args.get("city")
    state = request.args.get("state")
    lat_raw = request.args.get("lat")
    lng_raw = request.args.get("lng")
    lat = float(lat_raw) if lat_raw else None
    lng = float(lng_raw) if lng_raw else None

    body, status = donor_controller.list_camps(city=city, state=state, lat=lat, lng=lng)
    return jsonify(body), status


landing_bp = Blueprint("landing", __name__)


@landing_bp.post("/demo-request")
@validate_request(validate_demo_request)
def demo_request_route(data: DemoRequestData):
    body, status = donor_controller.demo_request(data)
    return jsonify(body), status

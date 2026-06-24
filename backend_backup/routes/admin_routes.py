from flask import Blueprint, jsonify

from controllers import hospital_controller
from middleware.auth import require_role
from middleware.validation import validate_request
from schemas.admin_schemas import ThresholdUpdateData, validate_threshold_update

admin_bp = Blueprint("admin", __name__)

_admin_roles = require_role("admin")


@admin_bp.get("/forecast")
@_admin_roles
def forecast_route():
    body, status = hospital_controller.get_forecast()
    return jsonify(body), status


@admin_bp.get("/waste-analytics")
@_admin_roles
def waste_analytics_route():
    body, status = hospital_controller.get_waste_analytics()
    return jsonify(body), status


@admin_bp.get("/thresholds")
@_admin_roles
def get_thresholds_route():
    body, status = hospital_controller.get_thresholds()
    return jsonify(body), status


@admin_bp.put("/thresholds")
@_admin_roles
@validate_request(validate_threshold_update)
def update_thresholds_route(data: ThresholdUpdateData):
    body, status = hospital_controller.update_thresholds(data)
    return jsonify(body), status

from flask import Blueprint, jsonify, request

from controllers import hospital_controller
from middleware.auth import require_role
from middleware.validation import validate_request
from schemas.hospital_schemas import (
    EmergencyStatusData,
    InventoryCreateData,
    InventoryUpdateData,
    validate_emergency_search_query,
    validate_emergency_status,
    validate_inventory_create,
    validate_inventory_update,
)

hospital_bp = Blueprint("hospital", __name__)
emergency_bp = Blueprint("emergency", __name__)

_hospital_roles = require_role("staff", "admin")


@hospital_bp.get("/inventory")
@_hospital_roles
def list_inventory_route():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    body, status = hospital_controller.list_inventory(page, per_page)
    return jsonify(body), status


@hospital_bp.post("/inventory")
@_hospital_roles
@validate_request(validate_inventory_create)
def create_inventory_route(data: InventoryCreateData):
    body, status = hospital_controller.create_inventory(data)
    return jsonify(body), status


@hospital_bp.put("/inventory/<int:batch_id>")
@_hospital_roles
@validate_request(validate_inventory_update)
def update_inventory_route(data: InventoryUpdateData, batch_id: int):
    body, status = hospital_controller.update_inventory(batch_id, data)
    return jsonify(body), status


@hospital_bp.delete("/inventory/<int:batch_id>")
@_hospital_roles
def delete_inventory_route(batch_id: int):
    body, status = hospital_controller.delete_inventory(batch_id)
    return jsonify(body), status


@hospital_bp.get("/expiry-alerts")
@_hospital_roles
def expiry_alerts_route():
    body, status = hospital_controller.list_expiry_alerts()
    return jsonify(body), status


@hospital_bp.get("/emergencies")
@_hospital_roles
def list_emergencies_route():
    body, status = hospital_controller.list_emergencies()
    return jsonify(body), status


@hospital_bp.patch("/emergencies/<int:emergency_id>/status")
@_hospital_roles
@validate_request(validate_emergency_status)
def update_emergency_status_route(data: EmergencyStatusData, emergency_id: int):
    body, status = hospital_controller.update_emergency_status(emergency_id, data)
    return jsonify(body), status


@hospital_bp.get("/notifications")
@_hospital_roles
def list_notifications_route():
    body, status = hospital_controller.list_notifications()
    return jsonify(body), status


@hospital_bp.patch("/notifications/<int:notification_id>/read")
@_hospital_roles
def mark_notification_read_route(notification_id: int):
    body, status = hospital_controller.mark_notification_read(notification_id)
    return jsonify(body), status


@hospital_bp.patch("/notifications/read-all")
@_hospital_roles
def mark_all_notifications_read_route():
    body, status = hospital_controller.mark_all_notifications_read()
    return jsonify(body), status


@emergency_bp.get("/search")
@_hospital_roles
def emergency_search_route():
    try:
        params = validate_emergency_search_query(request.args)
    except ValueError as exc:
        from middleware.errors import ApiError

        raise ApiError(str(exc), status_code=422, code="VALIDATION_ERROR") from exc
    body, status = hospital_controller.search_emergency(params)
    return jsonify(body), status

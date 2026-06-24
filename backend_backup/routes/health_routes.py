from flask import Blueprint, jsonify

from controllers.health_controller import health_check

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_route():
    body, status = health_check()
    return jsonify(body), status

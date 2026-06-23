"""RaktSetu API application factory."""

from flask import Flask

from config.settings import get_settings
from middleware.errors import register_error_handlers
from routes.auth_routes import auth_bp
from routes.donor_routes import donor_bp, landing_bp
from routes.hospital_routes import emergency_bp, hospital_bp
from routes.health_routes import health_bp
from services.db import close_pool, init_pool


def create_app() -> Flask:
    settings = get_settings()

    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["JSON_SORT_KEYS"] = False

    register_error_handlers(app)
    app.register_blueprint(health_bp, url_prefix="/v1")
    app.register_blueprint(auth_bp, url_prefix="/v1/auth")
    app.register_blueprint(donor_bp, url_prefix="/v1/donor")
    app.register_blueprint(landing_bp, url_prefix="/v1/landing")
    app.register_blueprint(hospital_bp, url_prefix="/v1/hospital")
    app.register_blueprint(emergency_bp, url_prefix="/v1/emergency")

    try:
        init_pool(settings)
    except Exception as exc:
        app.logger.warning("Database pool not initialized: %s", exc)

    return app


def shutdown_app(_app: Flask | None = None) -> None:
    close_pool()

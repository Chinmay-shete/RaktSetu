"""Register audit log flush on request teardown."""

from flask import Flask

from services.audit_service import flush_audit_logs


def register_audit_middleware(app: Flask) -> None:
    @app.teardown_request
    def _flush_audit_on_teardown(_exc=None):
        flush_audit_logs()

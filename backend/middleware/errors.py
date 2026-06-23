"""Standardized API error responses: { error, message, code }."""

from __future__ import annotations

from typing import Any

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """Application-level error mapped to a JSON response."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 400,
        code: str = "BAD_REQUEST",
        error: bool = True,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.error = error


def error_payload(
    message: str,
    *,
    code: str,
    error: bool = True,
) -> dict[str, Any]:
    return {"error": error, "message": message, "code": code}


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(exc: ApiError):
        return (
            jsonify(
                error_payload(
                    exc.message,
                    code=exc.code,
                    error=exc.error,
                )
            ),
            exc.status_code,
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
        code = exc.name.upper().replace(" ", "_") if exc.name else "HTTP_ERROR"
        message = exc.description or "Request failed"
        return jsonify(error_payload(message, code=code)), exc.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        app.logger.exception("Unhandled exception: %s", exc)
        return (
            jsonify(
                error_payload(
                    "An unexpected error occurred",
                    code="INTERNAL_SERVER_ERROR",
                )
            ),
            500,
        )

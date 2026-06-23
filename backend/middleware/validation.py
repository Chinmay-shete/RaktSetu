"""Request validation helpers (Cerberus — express-validator equivalent)."""

from __future__ import annotations

from functools import wraps
from typing import Callable, TypeVar

from flask import request

from middleware.errors import ApiError

T = TypeVar("T")


def validate_request(validator: Callable[[dict], T]) -> Callable:
    """Parse JSON and validate with the provided validator function."""

    def decorator(view: Callable):
        @wraps(view)
        def wrapper(*args, **kwargs):
            payload = request.get_json(silent=True)
            if payload is None:
                raise ApiError("Request body must be valid JSON", status_code=400, code="INVALID_JSON")
            try:
                validated = validator(payload)
            except ValueError as exc:
                raise ApiError(str(exc), status_code=422, code="VALIDATION_ERROR") from exc
            return view(validated, *args, **kwargs)

        return wrapper

    return decorator

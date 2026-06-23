"""RBAC ownership helper — resolves scope IDs from request sources."""

from __future__ import annotations

from flask import request

from middleware.errors import ApiError


def resolve_scope_id(key: str, kwargs: dict | None = None) -> int | None:
    kwargs = kwargs or {}

    if key in kwargs and kwargs[key] is not None:
        return int(kwargs[key])

    raw = request.args.get(key)
    if raw is not None and raw != "":
        try:
            return int(raw)
        except ValueError as exc:
            raise ApiError(f"{key} must be a valid integer", status_code=422, code="VALIDATION_ERROR") from exc

    body = request.get_json(silent=True) or {}
    if key in body and body[key] is not None and body[key] != "":
        try:
            return int(body[key])
        except (TypeError, ValueError) as exc:
            raise ApiError(f"{key} must be a valid integer", status_code=422, code="VALIDATION_ERROR") from exc

    return None

"""JWT authentication and role-based access control."""

from __future__ import annotations

from functools import wraps
from typing import Callable

from flask import g, request

from middleware.errors import ApiError
from middleware.ownership import resolve_scope_id
from services.auth_service import _get_user_by_id
from services.jwt_service import TOKEN_TYPE_ACCESS, decode_token


def _extract_bearer_token() -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise ApiError("Missing or invalid Authorization header", status_code=401, code="UNAUTHORIZED")
    token = auth_header[7:].strip()
    if not token:
        raise ApiError("Missing bearer token", status_code=401, code="UNAUTHORIZED")
    return token


def require_auth(view: Callable):
    """Validate JWT access token and attach the current user to flask.g."""

    @wraps(view)
    def wrapper(*args, **kwargs):
        token = _extract_bearer_token()
        payload = decode_token(token, expected_type=TOKEN_TYPE_ACCESS)
        user = _get_user_by_id(int(payload["sub"]))
        if not user:
            raise ApiError("User not found", status_code=401, code="UNAUTHORIZED")

        g.current_user = user
        g.token_payload = payload
        return view(*args, **kwargs)

    return wrapper


def require_role(*roles: str):
    """Restrict an endpoint to one or more roles."""

    allowed = set(roles)

    def decorator(view: Callable):
        @require_auth
        @wraps(view)
        def wrapper(*args, **kwargs):
            if g.current_user["role"] not in allowed:
                raise ApiError(
                    "You do not have permission to access this resource",
                    status_code=403,
                    code="FORBIDDEN",
                )
            return view(*args, **kwargs)

        return wrapper

    return decorator


def require_ownership(
    *,
    hospital_param: str = "hospital_id",
    district_param: str = "district_id",
):
    """
    Ensure hospital staff/admin only access their hospital_id and district
    officers only their district_id.
    """

    def decorator(view: Callable):
        @require_auth
        @wraps(view)
        def wrapper(*args, **kwargs):
            role = g.current_user["role"]

            if role in ("staff", "admin"):
                user_hospital_id = g.current_user.get("hospital_id")
                if user_hospital_id is None:
                    raise ApiError(
                        "Hospital account is not linked to a facility",
                        status_code=403,
                        code="FORBIDDEN",
                    )
                target_hospital_id = resolve_scope_id(hospital_param, kwargs) or user_hospital_id
                if int(target_hospital_id) != int(user_hospital_id):
                    raise ApiError(
                        "Cross-hospital access is not allowed",
                        status_code=403,
                        code="FORBIDDEN",
                    )

            elif role == "district":
                user_district_id = g.current_user.get("district_id")
                if user_district_id is None:
                    raise ApiError(
                        "District account is not linked to a district",
                        status_code=403,
                        code="FORBIDDEN",
                    )
                target_district_id = resolve_scope_id(district_param, kwargs) or user_district_id
                if int(target_district_id) != int(user_district_id):
                    raise ApiError(
                        "Cross-district access is not allowed",
                        status_code=403,
                        code="FORBIDDEN",
                    )

            return view(*args, **kwargs)

        return wrapper

    return decorator

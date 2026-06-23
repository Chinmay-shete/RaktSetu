"""Donor portal route handlers."""

from schemas.donor_schemas import (
    DemoRequestData,
    LocationData,
    PledgeData,
    ProfileCreateData,
    ProfileUpdateData,
)
from services import donor_service


def get_profile() -> tuple[dict, int]:
    return donor_service.get_profile(), 200


def create_profile(data: ProfileCreateData) -> tuple[dict, int]:
    return donor_service.create_profile(data), 201


def update_profile(data: ProfileUpdateData) -> tuple[dict, int]:
    return donor_service.update_profile(data), 200


def save_location(data: LocationData) -> tuple[dict, int]:
    return donor_service.save_location(data), 200


def list_donations() -> tuple[dict, int]:
    return donor_service.list_donations(), 200


def get_stats() -> tuple[dict, int]:
    return donor_service.get_stats(), 200


def list_urgent_requests() -> tuple[dict, int]:
    return donor_service.list_urgent_requests(), 200


def pledge(data: PledgeData) -> tuple[dict, int]:
    return donor_service.pledge_emergency(data), 201


def list_camps(**kwargs) -> tuple[dict, int]:
    return donor_service.list_camps(**kwargs), 200


def demo_request(data: DemoRequestData) -> tuple[dict, int]:
    return donor_service.save_demo_request(data.email), 201

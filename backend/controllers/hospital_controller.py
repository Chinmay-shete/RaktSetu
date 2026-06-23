"""Hospital and admin portal route handlers."""

from schemas.admin_schemas import ThresholdUpdateData
from schemas.hospital_schemas import (
    EmergencySearchParams,
    EmergencyStatusData,
    InventoryCreateData,
    InventoryUpdateData,
    TransferCreateData,
    TransferStatusData,
)
from services import admin_forecast_service as forecast_svc
from services import admin_threshold_service as threshold_svc
from services import hospital_emergency_service as emergency_svc
from services import hospital_inventory_service as inventory_svc
from services import hospital_notification_service as notification_svc
from services import hospital_transfer_service as transfer_svc


def list_inventory(page: int, per_page: int) -> tuple[dict, int]:
    return inventory_svc.list_inventory(page, per_page), 200


def create_inventory(data: InventoryCreateData) -> tuple[dict, int]:
    return inventory_svc.create_inventory(data), 201


def update_inventory(batch_id: int, data: InventoryUpdateData) -> tuple[dict, int]:
    return inventory_svc.update_inventory(batch_id, data), 200


def delete_inventory(batch_id: int) -> tuple[dict, int]:
    return inventory_svc.delete_inventory(batch_id), 200


def list_expiry_alerts() -> tuple[dict, int]:
    return inventory_svc.list_expiry_alerts(), 200


def list_emergencies() -> tuple[dict, int]:
    return emergency_svc.list_hospital_emergencies(), 200


def update_emergency_status(emergency_id: int, data: EmergencyStatusData) -> tuple[dict, int]:
    return emergency_svc.update_emergency_status(emergency_id, data), 200


def search_emergency(params: EmergencySearchParams) -> tuple[dict, int]:
    return emergency_svc.search_emergency_stock(params), 200


def list_notifications() -> tuple[dict, int]:
    return notification_svc.list_notifications(), 200


def mark_notification_read(notification_id: int) -> tuple[dict, int]:
    return notification_svc.mark_notification_read(notification_id), 200


def mark_all_notifications_read() -> tuple[dict, int]:
    return notification_svc.mark_all_notifications_read(), 200


def list_transfers() -> tuple[dict, int]:
    return transfer_svc.list_transfers(), 200


def create_transfer(data: TransferCreateData, idempotency_key: str) -> tuple[dict, int]:
    return transfer_svc.create_transfer(data, idempotency_key), 201


def update_transfer_status(transfer_id: int, data: TransferStatusData) -> tuple[dict, int]:
    return transfer_svc.update_transfer_status(transfer_id, data), 200


def get_forecast() -> tuple[dict, int]:
    return forecast_svc.get_forecast(), 200


def get_waste_analytics() -> tuple[dict, int]:
    return forecast_svc.get_waste_analytics(), 200


def get_thresholds() -> tuple[dict, int]:
    return threshold_svc.get_thresholds(), 200


def update_thresholds(data: ThresholdUpdateData) -> tuple[dict, int]:
    return threshold_svc.update_thresholds(data), 200

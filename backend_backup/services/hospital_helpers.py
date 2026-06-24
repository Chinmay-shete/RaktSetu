"""Inventory status helpers aligned with frontend mockApi logic."""

from __future__ import annotations

from datetime import date, datetime, timezone


def compute_inventory_status(units: int, reserved_units: int, expiry_date: date) -> tuple[str, int]:
  today = datetime.now(timezone.utc).date()
  diff_days = (expiry_date - today).days

  if diff_days < 0:
    return "Expired", diff_days
  if diff_days <= 30:
    return "Expiring Soon", diff_days
  if units - reserved_units <= 3:
    return "Low Stock", diff_days
  return "Available", diff_days


def epoch_ms(dt: datetime | None) -> int | None:
  if dt is None:
    return None
  if dt.tzinfo is None:
    dt = dt.replace(tzinfo=timezone.utc)
  return int(dt.timestamp() * 1000)

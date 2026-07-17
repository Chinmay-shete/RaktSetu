-- Migration 003: Add urgency_level column to emergency_requests
-- and apply scale indexes.
-- NOTE: emergency_requests has no created_at column — indexes reflect actual schema.

-- 1. Add urgency_level column (skip if already exists via the _migrations guard)
ALTER TABLE emergency_requests
  ADD COLUMN urgency_level ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium' AFTER units;

-- 2. Scale indexes (applied after urgency_level exists)
CREATE INDEX idx_donors_blood_location
  ON donors(blood_group, lat, lng, available_for_donation);

CREATE INDEX idx_emergency_blood_status
  ON emergency_requests(blood_group, status, urgency_level);

CREATE INDEX idx_donations_donor_date
  ON donations(donor_id, donation_date);

CREATE INDEX idx_notifications_user_read
  ON notifications(user_id, is_read, timestamp);

CREATE INDEX idx_blood_batches_scale
  ON blood_batches(hospital_id, blood_group, units, reserved_units, expiry_date);

CREATE INDEX idx_users_token_version
  ON users(id, token_version);

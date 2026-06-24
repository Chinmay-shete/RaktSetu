-- Phase 5: Transfers idempotency + alert threshold extras

USE raktsetu;

CREATE TABLE IF NOT EXISTS transfer_idempotency (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hospital_id      INT UNSIGNED NOT NULL,
  idempotency_key  VARCHAR(64) NOT NULL,
  transfer_id      INT UNSIGNED NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_transfer_idempotency (hospital_id, idempotency_key),
  CONSTRAINT fk_idempotency_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_idempotency_transfer
    FOREIGN KEY (transfer_id) REFERENCES transfer_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

ALTER TABLE transfer_requests
  ADD COLUMN source_batch_id INT UNSIGNED NULL,
  ADD CONSTRAINT fk_transfer_source_batch
    FOREIGN KEY (source_batch_id) REFERENCES blood_batches(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE alert_thresholds
  ADD COLUMN emergency_alerts TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN auto_transfer TINYINT(1) NOT NULL DEFAULT 0;

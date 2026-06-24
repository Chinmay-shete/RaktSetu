-- Phase 4: Hospital emergency dispatch responses

USE raktsetu;

CREATE TABLE IF NOT EXISTS emergency_responses (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  emergency_id  INT UNSIGNED NOT NULL,
  hospital_id   INT UNSIGNED NOT NULL,
  status        ENUM('accepted', 'declined') NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emergency_responses_emergency
    FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_emergency_responses_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_emergency_response (emergency_id, hospital_id),
  INDEX idx_emergency_responses_hospital (hospital_id, status)
) ENGINE=InnoDB;

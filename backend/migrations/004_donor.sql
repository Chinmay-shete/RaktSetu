-- Phase 3: Donor portal support tables

USE raktsetu;

ALTER TABLE donors
  ADD COLUMN donor_code VARCHAR(20) NULL,
  ADD COLUMN available_for_donation TINYINT(1) NOT NULL DEFAULT 1,
  ADD UNIQUE KEY uq_donors_code (donor_code);

CREATE TABLE IF NOT EXISTS donations (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_id       INT UNSIGNED NOT NULL,
  hospital_id    INT UNSIGNED NULL,
  camp_id        INT UNSIGNED NULL,
  donation_date  DATE NOT NULL,
  location_name  VARCHAR(255) NOT NULL,
  donation_type  ENUM('whole_blood', 'platelets', 'plasma') NOT NULL DEFAULT 'whole_blood',
  units          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status         ENUM('completed', 'cancelled', 'pending') NOT NULL DEFAULT 'completed',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_donations_donor
    FOREIGN KEY (donor_id) REFERENCES donors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_donations_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_donations_camp
    FOREIGN KEY (camp_id) REFERENCES donation_camps(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_donations_donor (donor_id, donation_date),
  INDEX idx_donations_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS emergency_pledges (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_id      INT UNSIGNED NOT NULL,
  emergency_id  INT UNSIGNED NOT NULL,
  status        ENUM('pledged', 'completed', 'cancelled') NOT NULL DEFAULT 'pledged',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pledges_donor
    FOREIGN KEY (donor_id) REFERENCES donors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pledges_emergency
    FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_pledge_donor_emergency (donor_id, emergency_id),
  INDEX idx_pledges_emergency (emergency_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS demo_requests (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_demo_email (email)
) ENGINE=InnoDB;

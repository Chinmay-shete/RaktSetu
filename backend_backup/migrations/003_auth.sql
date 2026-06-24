-- Phase 2: Authentication support tables

USE raktsetu;

ALTER TABLE users
  MODIFY password_hash VARCHAR(255) NULL;

CREATE TABLE IF NOT EXISTS otp_codes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone       VARCHAR(20) NOT NULL,
  code        CHAR(6) NOT NULL,
  purpose     ENUM('registration', 'login') NOT NULL DEFAULT 'registration',
  expires_at  TIMESTAMP NOT NULL,
  verified    TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_phone_purpose (phone, purpose, verified),
  INDEX idx_otp_expires (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff_invites (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token        VARCHAR(64) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  hospital_id  INT UNSIGNED NOT NULL,
  invited_by   INT UNSIGNED NULL,
  expires_at   TIMESTAMP NOT NULL,
  used_at      TIMESTAMP NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_staff_invites_token (token),
  INDEX idx_staff_invites_email (email),
  CONSTRAINT fk_staff_invites_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_staff_invites_invited_by
    FOREIGN KEY (invited_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  CHAR(64) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  revoked_at  TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  INDEX idx_refresh_user (user_id),
  INDEX idx_refresh_expires (expires_at),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

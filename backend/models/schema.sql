-- RaktSetu Database Schema
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS raktsetu;
USE raktsetu;

-- Disable foreign key checks temporarily to drop existing tables in case of resetting
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS alert_thresholds;
DROP TABLE IF EXISTS surgical_schedules;
DROP TABLE IF EXISTS forecasts;
DROP TABLE IF EXISTS donation_camps;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS emergency_requests;
DROP TABLE IF EXISTS transfer_requests;
DROP TABLE IF EXISTS blood_batches;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS staff_invites;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS districts;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Districts Table
CREATE TABLE districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  officer_id INT DEFAULT NULL,
  zone VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Hospitals Table
CREATE TABLE hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  district_id INT NOT NULL,
  type ENUM('Government', 'Private', 'Trust', 'Semi-Govt') DEFAULT 'Private',
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  location POINT NOT NULL SRID 4326,
  license_no VARCHAR(100) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  contact VARCHAR(100) NOT NULL,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE DEFAULT NULL,
  phone VARCHAR(15) UNIQUE DEFAULT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  role ENUM('donor', 'staff', 'admin', 'district', 'state', 'sysadmin') NOT NULL,
  hospital_id INT DEFAULT NULL,
  district_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Blood Batches Table
CREATE TABLE blood_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  units INT NOT NULL DEFAULT 0,
  reserved_units INT NOT NULL DEFAULT 0,
  collection_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  source VARCHAR(100) DEFAULT 'Donation',
  remarks TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Transfer Requests Table
CREATE TABLE transfer_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_hospital INT NOT NULL,
  to_hospital INT NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  units INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  message TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Emergency Requests Table
CREATE TABLE emergency_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  units INT NOT NULL,
  target_timestamp TIMESTAMP NOT NULL,
  status ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
  message TEXT DEFAULT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  location POINT NOT NULL SRID 4326
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications Table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  hospital_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Donors Table
CREATE TABLE donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  weight DECIMAL(5, 2) NOT NULL,
  chronic_illness BOOLEAN DEFAULT FALSE,
  last_donated_date DATE DEFAULT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  location POINT NOT NULL SRID 4326
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Donation Camps Table
CREATE TABLE donation_camps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  camp_date DATE NOT NULL,
  address VARCHAR(255) DEFAULT NULL,
  location POINT NOT NULL SRID 4326,
  district_id INT NOT NULL,
  organizer VARCHAR(255) NOT NULL,
  capacity INT DEFAULT NULL,
  expected_donors INT DEFAULT NULL,
  status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Forecasts Table
CREATE TABLE forecasts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  predicted_units INT NOT NULL,
  forecast_date DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Surgical Schedules Table
CREATE TABLE surgical_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  surgery_date DATE NOT NULL,
  surgery_type VARCHAR(150) NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  units INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Alert Thresholds Table
CREATE TABLE alert_thresholds (
  hospital_id INT PRIMARY KEY,
  min_stock INT NOT NULL DEFAULT 10,
  max_stock INT NOT NULL DEFAULT 100,
  critical_units INT NOT NULL DEFAULT 5,
  expiry_days INT NOT NULL DEFAULT 7
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Audit Logs Table
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT DEFAULT NULL,
  action VARCHAR(255) NOT NULL,
  severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
  ip_address VARCHAR(45) DEFAULT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. OTP Codes Table (Auth Support)
CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code CHAR(6) NOT NULL,
  purpose ENUM('registration', 'login') NOT NULL DEFAULT 'registration',
  expires_at TIMESTAMP NOT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_phone_purpose (phone, purpose, verified),
  INDEX idx_otp_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Staff Invites Table (Auth Support)
CREATE TABLE staff_invites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  hospital_id INT NOT NULL,
  invited_by INT DEFAULT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_staff_invites_token (token),
  INDEX idx_staff_invites_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Refresh Tokens Table (Auth Support)
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  INDEX idx_refresh_user (user_id),
  INDEX idx_refresh_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- INDEXES DEFINITION
-- =========================================================================

-- Compound Indexes: hospital_id + blood_group
CREATE INDEX idx_blood_batches_hosp_bg ON blood_batches(hospital_id, blood_group);
CREATE INDEX idx_forecasts_hosp_bg ON forecasts(hospital_id, blood_group);
CREATE INDEX idx_surgical_schedules_hosp_bg ON surgical_schedules(hospital_id, blood_group);

-- Expiry Date Index
CREATE INDEX idx_blood_batches_expiry ON blood_batches(expiry_date);

-- Spatial Indexes on location (requires POINT NOT NULL and InnoDB engine)
CREATE SPATIAL INDEX idx_hospitals_location ON hospitals(location);
CREATE SPATIAL INDEX idx_emergency_requests_location ON emergency_requests(location);
CREATE SPATIAL INDEX idx_donors_location ON donors(location);
CREATE SPATIAL INDEX idx_donation_camps_location ON donation_camps(location);

-- Additional lookup indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_donation_camps_date ON donation_camps(camp_date);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);

-- =========================================================================
-- FOREIGN KEY CONSTRAINTS DEFINITION
-- =========================================================================

-- Applying ALTER TABLE statements to handle circular dependencies cleanly
ALTER TABLE districts 
  ADD CONSTRAINT fk_districts_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE hospitals 
  ADD CONSTRAINT fk_hospitals_district FOREIGN KEY (district_id) REFERENCES districts(id);

ALTER TABLE users 
  ADD CONSTRAINT fk_users_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL;

ALTER TABLE blood_batches 
  ADD CONSTRAINT fk_blood_batches_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE transfer_requests 
  ADD CONSTRAINT fk_transfers_from FOREIGN KEY (from_hospital) REFERENCES hospitals(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_transfers_to FOREIGN KEY (to_hospital) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE emergency_requests 
  ADD CONSTRAINT fk_emergency_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE notifications 
  ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_notifications_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE donors 
  ADD CONSTRAINT fk_donors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE donation_camps 
  ADD CONSTRAINT fk_donation_camps_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE;

ALTER TABLE forecasts 
  ADD CONSTRAINT fk_forecasts_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE surgical_schedules 
  ADD CONSTRAINT fk_surgical_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE alert_thresholds 
  ADD CONSTRAINT fk_alert_thresholds_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE;

ALTER TABLE audit_logs 
  ADD CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE staff_invites 
  ADD CONSTRAINT fk_staff_invites_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_staff_invites_invited_by FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE refresh_tokens 
  ADD CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

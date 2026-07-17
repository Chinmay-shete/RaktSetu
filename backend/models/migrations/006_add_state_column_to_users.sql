-- Migration 006: Add 'state' column to the users table
-- Required for the 'state' role users (State Health Coordinators) to store their assigned state.
-- Also adds lat/lng columns to districts for the state admin map view.
-- Uses safe IF NOT EXISTS check via INFORMATION_SCHEMA for compatibility with MySQL 5.7+

-- Add 'state' column to users if not present
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'state'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `state` VARCHAR(100) DEFAULT NULL AFTER `designation`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add 'lat' to districts if not present
SET @col_exists2 = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'districts'
    AND COLUMN_NAME = 'lat'
);
SET @sql2 = IF(@col_exists2 = 0,
  'ALTER TABLE districts ADD COLUMN `lat` DECIMAL(10, 7) DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Add 'lng' to districts if not present
SET @col_exists3 = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'districts'
    AND COLUMN_NAME = 'lng'
);
SET @sql3 = IF(@col_exists3 = 0,
  'ALTER TABLE districts ADD COLUMN `lng` DECIMAL(11, 7) DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

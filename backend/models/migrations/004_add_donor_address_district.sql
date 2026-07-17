-- Migration 004: Add address and district columns to donors table
-- These columns were added to schema.sql but were never migrated to existing databases.
-- This caused "Failed to save profile" on the LocationPage for all existing deployments.
-- 
-- Uses SET + PREPARE pattern for compatibility with MySQL 5.7, 8.0, 9.x

-- Add 'address' column if not exists
SET @col_address_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'donors'
    AND COLUMN_NAME  = 'address'
);
SET @add_address = IF(@col_address_exists = 0,
  'ALTER TABLE donors ADD COLUMN address VARCHAR(255) DEFAULT NULL',
  'SELECT 1'
);
PREPARE _stmt FROM @add_address;
EXECUTE _stmt;
DEALLOCATE PREPARE _stmt;

-- Add 'district' column if not exists
SET @col_district_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'donors'
    AND COLUMN_NAME  = 'district'
);
SET @add_district = IF(@col_district_exists = 0,
  'ALTER TABLE donors ADD COLUMN district VARCHAR(100) DEFAULT NULL',
  'SELECT 1'
);
PREPARE _stmt FROM @add_district;
EXECUTE _stmt;
DEALLOCATE PREPARE _stmt;

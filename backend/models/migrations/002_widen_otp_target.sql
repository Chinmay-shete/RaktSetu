-- Migration: widen otp_codes.phone to VARCHAR(255)
-- Reason: The 'phone' column stores both phone numbers AND email addresses
-- as OTP targets.  VARCHAR(20) is too short for most real-world email
-- addresses (e.g. "john.doe+tag@company.co.in" is 27 chars).
-- This migration is required if your database was created from an older schema.

ALTER TABLE otp_codes
  MODIFY phone VARCHAR(255) NOT NULL;

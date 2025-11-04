-- Add email verification fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP;

-- Shelters and admins are automatically verified (they don't need email verification)
UPDATE users
SET email_verified = true
WHERE role IN ('shelter', 'admin');

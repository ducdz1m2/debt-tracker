-- Add full_name and address fields to users table
ALTER TABLE users
ADD COLUMN full_name TEXT,
ADD COLUMN address TEXT;

-- Remove foreign key constraint temporarily for testing
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_assigned_to_fkey;

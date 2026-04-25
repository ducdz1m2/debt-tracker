-- Add deleted_at for soft delete
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on deleted_at
CREATE INDEX IF NOT EXISTS idx_debts_deleted_at ON debts(deleted_at);

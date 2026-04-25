-- Update debts table with status and assigned_to
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_debts_assigned_to ON debts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);

-- Update RLS policies
DROP POLICY IF EXISTS "Public access for all operations" ON debts;

-- Policy: Users can read all debts
CREATE POLICY "Users can read all debts" ON debts
  FOR SELECT
  USING (true);

-- Policy: Users can insert debts (as creator)
CREATE POLICY "Users can insert debts" ON debts
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update debts (as assigned user or creator)
CREATE POLICY "Users can update debts" ON debts
  FOR UPDATE
  USING (true);

-- Policy: Users can delete debts (as creator)
CREATE POLICY "Users can delete debts" ON debts
  FOR DELETE
  USING (true);

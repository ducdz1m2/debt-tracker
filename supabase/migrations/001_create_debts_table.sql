-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  debt_date DATE NOT NULL,
  debtor_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (simplified for friend group)
CREATE POLICY "Public access for all operations" ON debts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert payments
CREATE POLICY "Allow insert payments" ON payments
FOR INSERT
TO public
WITH CHECK (true);

-- Policy to allow anyone to read payments
CREATE POLICY "Allow select payments" ON payments
FOR SELECT
TO public
USING (true);

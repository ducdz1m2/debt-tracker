-- Create group_members table to manage group members
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read group members
CREATE POLICY "Anyone can read group members" ON group_members
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert group members (for initial setup)
CREATE POLICY "Anyone can insert group members" ON group_members
  FOR INSERT
  WITH CHECK (true);

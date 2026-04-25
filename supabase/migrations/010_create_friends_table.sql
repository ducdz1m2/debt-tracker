-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own friend relationships
CREATE POLICY "Users can view own friends"
ON friends FOR SELECT
TO public
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Policy: Users can create friend requests
CREATE POLICY "Users can create friend requests"
ON friends FOR INSERT
TO public
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update friend requests (accept/reject)
CREATE POLICY "Users can update friend requests"
ON friends FOR UPDATE
TO public
USING (friend_id = auth.uid() OR user_id = auth.uid());

-- Enable Realtime for friends table
begin;
drop publication if exists supabase_realtime;
create publication supabase_realtime;
commit;
alter publication supabase_realtime add table friends;

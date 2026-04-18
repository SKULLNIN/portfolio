-- MSN-style live chat schema for Supabase (run in SQL Editor).
-- After running: Authentication → Providers → enable Anonymous sign-ins.
-- Database → Replication → enable Realtime for table `messages`.

-- Extensions (usually already on)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users profile (linked to auth.users via same id)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'online' CHECK (status IN ('online','away','busy','offline')),
  status_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  nudge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop policies if re-running (names must match)
DROP POLICY IF EXISTS "users_select_partners" ON users;
DROP POLICY IF EXISTS "users_insert_self" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "conv_select_member" ON conversations;
DROP POLICY IF EXISTS "cm_select_own" ON conversation_members;
DROP POLICY IF EXISTS "messages_select_members" ON messages;
DROP POLICY IF EXISTS "messages_insert_member_as_sender" ON messages;

CREATE POLICY "users_select_partners" ON users FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM conversation_members cm_self
    JOIN conversation_members cm_other
      ON cm_other.conversation_id = cm_self.conversation_id
     AND cm_other.user_id = users.id
    WHERE cm_self.user_id = auth.uid()
  )
);

CREATE POLICY "users_insert_self" ON users FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_self" ON users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "conv_select_member" ON conversations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = conversations.id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "cm_select_own" ON conversation_members FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "messages_select_members" ON messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "messages_insert_member_as_sender" ON messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid()
  )
);

-- Realtime (Supabase pools publication); ignore error if already added.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- After you create your own user in Supabase Auth (Authentication → Users),
-- add a matching public profile (use the same UUID as in auth.users):
-- INSERT INTO public.users (id, username, display_name)
-- VALUES ('PASTE_YOUR_AUTH_USER_ID', 'portfolio_owner', 'Your name');
-- This id must match NEXT_PUBLIC_MSN_OWNER_USER_ID in your Next.js env.

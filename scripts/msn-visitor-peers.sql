-- Run once in SQL Editor after main MSN schema (links browser visitor_key → auth user + conversation).

CREATE TABLE IF NOT EXISTS msn_visitor_peers (
  visitor_key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS msn_visitor_peers_user_id_idx ON msn_visitor_peers(user_id);

ALTER TABLE msn_visitor_peers ENABLE ROW LEVEL SECURITY;

-- Optional: drop legacy unique-on-user constraint if present (same guest may rotate visitor_key)
DROP INDEX IF EXISTS msn_visitor_peers_user_id_uidx;

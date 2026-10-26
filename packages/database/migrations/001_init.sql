CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz,
  locked_until timestamptz
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','developer','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS verification_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portal text NOT NULL CHECK (portal IN ('user','developer','admin')),
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  consumed_at timestamptz,
  requested_ip_hash text NOT NULL
);
CREATE INDEX IF NOT EXISTS verification_challenges_lookup_idx
  ON verification_challenges (user_id, portal, created_at DESC);
CREATE INDEX IF NOT EXISTS verification_challenges_expiry_idx
  ON verification_challenges (expires_at) WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portal text NOT NULL CHECK (portal IN ('user','developer','admin')),
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  idle_expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_ip_hash text NOT NULL,
  user_agent_hash text NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_portal_idx ON sessions (user_id, portal) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  hits integer NOT NULL CHECK (hits >= 0)
);

CREATE TABLE IF NOT EXISTS security_events (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  portal text CHECK (portal IN ('user','developer','admin')),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS security_events_created_idx ON security_events (created_at DESC);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO schema_migrations (version) VALUES ('001_init') ON CONFLICT DO NOTHING;

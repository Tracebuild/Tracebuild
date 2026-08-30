-- ============================================================
-- Konsolidierte Migration: alle ausstehenden Schema-Änderungen
-- Idempotent — kann mehrfach ausgeführt werden ohne Fehler
-- ============================================================

-- ── 20240003: norms + project_norms ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS norms (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text        NOT NULL,
  domain            text        NOT NULL DEFAULT 'bau',
  layer             int         NOT NULL DEFAULT 2,
  jurisdiction_type text        NOT NULL,
  jurisdiction_name text,
  org_id            uuid        REFERENCES organizations(id) ON DELETE CASCADE,
  category          text        NOT NULL DEFAULT 'andere',
  text              text        NOT NULL,
  source_url        text,
  source_doc        text,
  embedding         vector(1536),
  valid_from        date,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Uniqueness across (title, jurisdiction_type, jurisdiction_name, org_id) where the
-- latter two are nullable. A table-level UNIQUE constraint cannot hold expressions
-- (COALESCE), and plain UNIQUE would treat every NULL as distinct — so a unique
-- INDEX over the COALESCE'd values is the only way to express this in Postgres.
CREATE UNIQUE INDEX IF NOT EXISTS norms_identity_uniq ON norms (
  title,
  jurisdiction_type,
  COALESCE(jurisdiction_name, ''),
  COALESCE(org_id::text, '')
);

CREATE TABLE IF NOT EXISTS project_norms (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  norm_id     uuid        NOT NULL REFERENCES norms(id) ON DELETE CASCADE,
  added_by    text        NOT NULL DEFAULT 'system',
  added_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, norm_id)
);

ALTER TABLE norms  ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_norms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY norms_public_read ON norms FOR SELECT USING (org_id IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY norms_org_read ON norms FOR SELECT
    USING (org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY norms_org_insert ON norms FOR INSERT
    WITH CHECK (org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY project_norms_access ON project_norms FOR ALL
    USING (project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid())
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 20240004: projects — parcel_number + bauzone ─────────────────────────────

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN parcel_number text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN bauzone text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ── 20240005: analysis_items — extended fields ───────────────────────────────

DO $$ BEGIN
  ALTER TABLE analysis_items ADD COLUMN norm_id uuid REFERENCES norms(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE analysis_items ADD COLUMN norm_title text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE analysis_items ADD COLUMN category text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE analysis_items ADD COLUMN confidence text NOT NULL DEFAULT 'medium';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE analysis_items ADD COLUMN page_reference int;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ── 20240006: permissions — role check + project_members ─────────────────────

UPDATE users SET role = 'org_admin' WHERE role = 'owner';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('super_admin', 'org_admin', 'project_manager', 'member'));

CREATE TABLE IF NOT EXISTS project_members (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  added_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY project_members_org_read ON project_members FOR SELECT
    USING (project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid())
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY project_members_org_write ON project_members FOR ALL
    USING (project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid())
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 20240007: chat_messages — cost tracking ───────────────────────────────────

DO $$ BEGIN
  ALTER TABLE chat_messages ADD COLUMN cost_usd numeric;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ── 20240100: chat_messages — thread support ─────────────────────────────────

DO $$ BEGIN
  ALTER TABLE chat_messages ADD COLUMN thread_id uuid;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
  ON chat_messages(project_id, thread_id, created_at);

-- Permissions: roles on users + project_members join table
-- Migrate 'owner' → 'org_admin', then add CHECK constraint.

-- 1. Update existing 'owner' rows to 'org_admin'
UPDATE users SET role = 'org_admin' WHERE role = 'owner';

-- 2. Drop old constraint if it exists, add new one
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('super_admin', 'org_admin', 'project_manager', 'member'));

-- 3. Project members — fine-grained access control
CREATE TABLE IF NOT EXISTS project_members (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  added_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Members visible to anyone in the same org
CREATE POLICY project_members_org_read ON project_members
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid())
    )
  );

CREATE POLICY project_members_org_write ON project_members
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid())
    )
  );

-- 4. Expose org_id + role together in a helper view (used by RLS)
-- (No new RLS on projects: admin client is always used server-side)

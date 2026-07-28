-- Norms table: structured regulation/standard records with semantic search
-- Separate from the `standards` table; supports per-org private norms and
-- a many-to-many link to projects via project_norms.

-- ── Norms ────────────────────────────────────────────────────────────────────

CREATE TABLE norms (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text        NOT NULL,
  domain            text        NOT NULL DEFAULT 'bau',
  layer             int         NOT NULL DEFAULT 2,
  -- 1=International, 2=National, 3=Cantonal/Industry, 4=Municipal, 5=Org
  jurisdiction_type text        NOT NULL,
  -- 'international' | 'national' | 'cantonal' | 'municipal' | 'org'
  jurisdiction_name text,
  -- e.g. 'ZH', 'Mels', 'ISO', null for international/national
  org_id            uuid        REFERENCES organizations(id) ON DELETE CASCADE,
  -- null = public norm; non-null = org-private norm
  category          text        NOT NULL,
  text              text        NOT NULL,
  source_url        text,
  source_doc        text,
  embedding         vector(1536),
  valid_from        date,
  created_at        timestamptz NOT NULL DEFAULT now(),

  UNIQUE (title, jurisdiction_type, jurisdiction_name, org_id)
);

-- ── Project ↔ Norm (many-to-many) ────────────────────────────────────────────

CREATE TABLE project_norms (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid        NOT NULL REFERENCES projects(id)  ON DELETE CASCADE,
  norm_id    uuid        NOT NULL REFERENCES norms(id)     ON DELETE CASCADE,
  added_by   text        NOT NULL DEFAULT 'system',
  -- 'system' = auto-assigned on project creation; 'user' = manually added
  added_at   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (project_id, norm_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX ON norms (domain, layer, jurisdiction_type, jurisdiction_name);
CREATE INDEX ON norms (org_id) WHERE org_id IS NOT NULL;
CREATE INDEX ON project_norms (project_id);
CREATE INDEX ON project_norms (norm_id);

-- IVFFlat for approximate nearest-neighbour search (cosine distance).
-- lists=100 is a reasonable default for up to ~1M rows; tune after bulk load.
CREATE INDEX ON norms USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE norms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_norms ENABLE ROW LEVEL SECURITY;

-- Public norms (org_id IS NULL) are readable by every authenticated user.
CREATE POLICY "norms_public_read" ON norms
  FOR SELECT USING (org_id IS NULL);

-- Org-private norms are only visible to members of the owning org.
CREATE POLICY "norms_org_read" ON norms
  FOR SELECT USING (
    org_id IS NOT NULL
    AND org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- Members may insert norms scoped to their own org.
CREATE POLICY "norms_org_insert" ON norms
  FOR INSERT WITH CHECK (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- project_norms: access follows project ownership (same org).
CREATE POLICY "project_norms_access" ON project_norms
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects
      WHERE org_id = (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

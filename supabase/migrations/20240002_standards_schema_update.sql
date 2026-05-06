-- Migrate standards table to multi-domain jurisdiction schema

-- Drop old composite index (will be replaced)
DROP INDEX IF EXISTS standards_domain_region_idx;

-- Add new columns; defaults handle existing rows during migration
ALTER TABLE standards
  ADD COLUMN layer             int  NOT NULL DEFAULT 2,
  ADD COLUMN jurisdiction_type text NOT NULL DEFAULT 'cantonal',
  ADD COLUMN jurisdiction_name text,
  ADD COLUMN org_id            uuid REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN source_doc        text;

-- Backfill jurisdiction_name from legacy region values
UPDATE standards
  SET jurisdiction_name = split_part(region, '-', 2)
  WHERE region LIKE 'CH-%';

UPDATE standards
  SET jurisdiction_name = region
  WHERE region NOT LIKE 'CH-%'
    AND region IS NOT NULL
    AND region != ''
    AND jurisdiction_name IS NULL;

-- Remove the legacy column
ALTER TABLE standards DROP COLUMN region;

-- Indexes
CREATE INDEX ON standards (domain, layer, jurisdiction_type, jurisdiction_name);
CREATE INDEX ON standards (org_id) WHERE org_id IS NOT NULL;

-- RLS: replace catch-all public read with scope-aware policies
DROP POLICY IF EXISTS "standards_public_read" ON standards;

CREATE POLICY "standards_public_read" ON standards
  FOR SELECT USING (org_id IS NULL);

CREATE POLICY "standards_org_read" ON standards
  FOR SELECT USING (
    org_id IS NOT NULL AND
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  );

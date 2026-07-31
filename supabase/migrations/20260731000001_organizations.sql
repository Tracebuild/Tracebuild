-- Migration: Extend organizations table for Admin Portal
-- Adds all fields required by the admin CRUD API.
-- Safe to apply on top of 001_initial_schema.sql.

-- ── New columns ──────────────────────────────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS slug             TEXT,
  ADD COLUMN IF NOT EXISTS description      TEXT,
  ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan             TEXT NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS owner_name       TEXT,
  ADD COLUMN IF NOT EXISTS owner_email      TEXT,
  ADD COLUMN IF NOT EXISTS user_limit       INTEGER,
  ADD COLUMN IF NOT EXISTS project_limit    INTEGER,
  ADD COLUMN IF NOT EXISTS storage_limit_gb NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS monthly_budget   NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS closed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_default       BOOLEAN NOT NULL DEFAULT false;

-- ── Migrate legacy plan_tier values → plan ───────────────────────────────────
UPDATE organizations SET plan =
  CASE plan_tier
    WHEN 'free'       THEN 'starter'
    WHEN 'pro'        THEN 'business'
    WHEN 'enterprise' THEN 'enterprise'
    ELSE 'starter'
  END;

-- ── Slug helper function ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION slugify(input_text TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(input_text);
  result := replace(result, 'ä', 'ae');
  result := replace(result, 'ö', 'oe');
  result := replace(result, 'ü', 'ue');
  result := replace(result, 'ß', 'ss');
  result := replace(result, 'à', 'a');
  result := replace(result, 'â', 'a');
  result := replace(result, 'é', 'e');
  result := replace(result, 'è', 'e');
  result := replace(result, 'ê', 'e');
  result := replace(result, 'ç', 'c');
  result := regexp_replace(result, '[^a-z0-9\s]', '', 'g');
  result := trim(result);
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+',  '-', 'g');
  IF result = '' OR result = '-' THEN result := 'org'; END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── Back-fill slug for existing rows ─────────────────────────────────────────
DO $$
DECLARE
  rec        RECORD;
  base_slug  TEXT;
  final_slug TEXT;
  counter    INT;
BEGIN
  FOR rec IN SELECT id, name FROM organizations WHERE slug IS NULL ORDER BY created_at LOOP
    base_slug  := slugify(rec.name);
    final_slug := base_slug;
    counter    := 0;
    WHILE EXISTS (
      SELECT 1 FROM organizations WHERE slug = final_slug AND id <> rec.id
    ) LOOP
      counter    := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    UPDATE organizations SET slug = final_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- ── Enforce NOT NULL + UNIQUE on slug ────────────────────────────────────────
ALTER TABLE organizations ALTER COLUMN slug SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE organizations ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Trigger: auto-generate slug on INSERT when not provided ──────────────────
CREATE OR REPLACE FUNCTION organizations_auto_slug() RETURNS TRIGGER AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INT := 0;
BEGIN
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    base_slug  := slugify(NEW.name);
    final_slug := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM organizations WHERE slug = final_slug AND id <> NEW.id
    ) LOOP
      counter    := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organizations_auto_slug ON organizations;
CREATE TRIGGER organizations_auto_slug
  BEFORE INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION organizations_auto_slug();

-- ── Trigger: keep updated_at current ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organizations_set_updated_at ON organizations;
CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_organizations_slug
  ON organizations (slug);

CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at
  ON organizations (deleted_at)
  WHERE deleted_at IS NULL;

-- Allows a super_admin to "promote" an org-owned norm to platform-wide
-- (org_id set to NULL) while keeping provenance of which org it came from.
ALTER TABLE norms
  ADD COLUMN promoted_from_org_id uuid REFERENCES organizations(id),
  ADD COLUMN promoted_at timestamptz;

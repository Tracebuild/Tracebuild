-- Extend analysis_items with structured output fields from the new JSON schema

ALTER TABLE analysis_items
  ADD COLUMN norm_id        uuid        REFERENCES norms(id) ON DELETE SET NULL,
  ADD COLUMN norm_title     text,
  ADD COLUMN category       text,
  -- grenzabstand | gebaeudehöhe | erschliessung | brandschutz | parkierung | andere
  ADD COLUMN confidence     text        NOT NULL DEFAULT 'medium',
  -- high | medium | low
  ADD COLUMN page_reference int;
  -- PDF page the finding is on (1-indexed), null = whole plan

-- The existing `note` column is kept as the primary text (stores `finding`).
-- The existing `standard_id` column is kept; new analyses use `norm_id` instead.

CREATE INDEX ON analysis_items (norm_id) WHERE norm_id IS NOT NULL;

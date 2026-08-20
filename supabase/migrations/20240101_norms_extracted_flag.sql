-- Marks whether a norm's `text` already holds the concrete extracted rule content,
-- or is still just a generic placeholder pointing at its source (e.g. a freshly
-- auto-imported geoportal reference, not yet processed by norm extraction).
-- Existing rows default to true: they were entered with real content already.

ALTER TABLE norms
  ADD COLUMN extracted boolean NOT NULL DEFAULT true;

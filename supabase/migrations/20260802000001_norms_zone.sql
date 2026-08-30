-- A norm can be tagged with the specific Bauzone(n) it applies to (e.g. "W2" or
-- "W2,W3" for a Baureglement article that covers several zones as separate rows).
-- NULL/empty = the norm applies regardless of zone (e.g. most Bundesrecht).
ALTER TABLE norms
  ADD COLUMN zone text;

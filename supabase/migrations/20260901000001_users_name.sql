-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Name der Person auf users + Schutz gegen doppelte Konten
--
-- Hintergrund: Der Einladungs-Flow erfasst neu Name + E-Mail + Rolle.
-- Die users-Tabelle kannte bisher nur id/org_id/role/email/created_at.
--
-- Mehrfach ausführbar (IF NOT EXISTS / DO-Blöcke).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Namensspalte ──────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name TEXT;

COMMENT ON COLUMN users.name IS
  'Anzeigename der Person. Wird beim Einladen erfasst und zusaetzlich in auth.users.raw_user_meta_data.full_name gespiegelt.';

-- ── 2. Bestehende Zeilen aus den Auth-Metadaten nachziehen ───────────────────
UPDATE users u
SET    name = NULLIF(TRIM(COALESCE(
         a.raw_user_meta_data ->> 'full_name',
         a.raw_user_meta_data ->> 'name'
       )), '')
FROM   auth.users a
WHERE  a.id = u.id
  AND (u.name IS NULL OR TRIM(u.name) = '');

-- ── 3. E-Mail eindeutig ──────────────────────────────────────────────────────
-- Ohne diesen Index kann dieselbe Person mehrfach in users landen; die
-- Duplikatspruefung im Einladungs-Endpunkt liefert dann unzuverlaessige
-- Ergebnisse. Der Index wird nur angelegt, wenn es aktuell keine Duplikate
-- gibt — sonst bricht die Migration nicht ab, sondern meldet es nur.
DO $$
DECLARE
  dupes INT;
BEGIN
  SELECT count(*) INTO dupes
  FROM (SELECT lower(email) FROM users GROUP BY 1 HAVING count(*) > 1) d;

  IF dupes = 0 THEN
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (lower(email));
  ELSE
    RAISE NOTICE 'users: % doppelte E-Mail-Adressen gefunden — unique index NICHT angelegt. Bitte zuerst bereinigen.', dupes;
  END IF;
END $$;

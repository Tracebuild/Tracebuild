-- Extend projects table with parcel identification and land-use zone

ALTER TABLE projects
  ADD COLUMN parcel_number text,
  ADD COLUMN bauzone       text;

-- parcel_number: e.g. "1234" — the cadastral plot number
-- bauzone: cantonal zone code returned by geodienste.ch (e.g. "W2", "G", "I")
--          or manually entered by the user as a fallback

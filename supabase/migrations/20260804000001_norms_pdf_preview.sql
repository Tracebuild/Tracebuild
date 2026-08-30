-- Adds a nullable pdf_url column to norms so the original uploaded PDF can be
-- previewed later. Stays null for .txt uploads and also stays null (not a bug)
-- when the file is a PDF but the storage upload itself fails — the extracted
-- norm text is never blocked on the PDF-preview upload succeeding.
ALTER TABLE norms ADD COLUMN pdf_url text;

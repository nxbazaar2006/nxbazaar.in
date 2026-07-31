ALTER TABLE "hsn_codes"
  ADD COLUMN IF NOT EXISTS "chapter" TEXT;

CREATE INDEX IF NOT EXISTS "hsn_codes_chapter_idx" ON "hsn_codes"("chapter");

ALTER TABLE "hsn_codes"
  DROP COLUMN IF EXISTS "shortDescription",
  DROP COLUMN IF EXISTS "chapter",
  DROP COLUMN IF EXISTS "heading",
  DROP COLUMN IF EXISTS "subHeading",
  DROP COLUMN IF EXISTS "effectiveFrom";

DROP INDEX IF EXISTS "hsn_codes_chapter_idx";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaxMappingStatus') THEN
    CREATE TYPE "TaxMappingStatus" AS ENUM ('MAPPED', 'PENDING_REVIEW');
  END IF;
END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "taxMappingStatus" "TaxMappingStatus" NOT NULL DEFAULT 'PENDING_REVIEW';

UPDATE "Product"
SET "taxMappingStatus" = 'MAPPED'
WHERE "hsnCodeId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Product_taxMappingStatus_idx" ON "Product"("taxMappingStatus");

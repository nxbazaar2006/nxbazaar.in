DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HsnStatus') THEN
    CREATE TYPE "HsnStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HsnTaxType') THEN
    CREATE TYPE "HsnTaxType" AS ENUM ('TAXABLE', 'NIL_RATED', 'EXEMPT', 'NON_GST');
  END IF;
END $$;

ALTER TABLE IF EXISTS "HsnCode" RENAME TO "hsn_codes";

ALTER TABLE IF EXISTS "hsn_codes"
  ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "chapter" TEXT,
  ADD COLUMN IF NOT EXISTS "heading" TEXT,
  ADD COLUMN IF NOT EXISTS "subHeading" TEXT,
  ADD COLUMN IF NOT EXISTS "uqc" TEXT,
  ADD COLUMN IF NOT EXISTS "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "effectiveFrom" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "effectiveTo" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdById" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedById" TEXT;

ALTER TABLE IF EXISTS "hsn_codes"
  ALTER COLUMN "gstRate" TYPE DECIMAL(5,2) USING COALESCE("gstRate", 0)::DECIMAL(5,2),
  ALTER COLUMN "gstRate" SET NOT NULL,
  ALTER COLUMN "cgstRate" TYPE DECIMAL(5,2) USING COALESCE("cgstRate", 0)::DECIMAL(5,2),
  ALTER COLUMN "cgstRate" SET NOT NULL,
  ALTER COLUMN "sgstRate" TYPE DECIMAL(5,2) USING COALESCE("sgstRate", 0)::DECIMAL(5,2),
  ALTER COLUMN "sgstRate" SET NOT NULL,
  ALTER COLUMN "igstRate" TYPE DECIMAL(5,2) USING COALESCE("igstRate", 0)::DECIMAL(5,2),
  ALTER COLUMN "igstRate" SET NOT NULL,
  ALTER COLUMN "cessRate" TYPE DECIMAL(5,2) USING COALESCE("cessRate", 0)::DECIMAL(5,2),
  ALTER COLUMN "cessRate" SET DEFAULT 0,
  ALTER COLUMN "cessRate" SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hsn_codes' AND column_name = 'isActive'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hsn_codes' AND column_name = 'status'
  ) THEN
    ALTER TABLE "hsn_codes" ADD COLUMN "status" "HsnStatus";
    UPDATE "hsn_codes" SET "status" = CASE WHEN "isActive" THEN 'ACTIVE'::"HsnStatus" ELSE 'INACTIVE'::"HsnStatus" END;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hsn_codes' AND column_name = 'status'
  ) THEN
    ALTER TABLE "hsn_codes" ADD COLUMN "status" "HsnStatus" NOT NULL DEFAULT 'ACTIVE';
  END IF;
  ALTER TABLE "hsn_codes" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
  ALTER TABLE "hsn_codes" ALTER COLUMN "status" SET NOT NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hsn_codes' AND column_name = 'taxTreatment'
  ) THEN
    ALTER TABLE "hsn_codes" ADD COLUMN IF NOT EXISTS "taxType_new" "HsnTaxType";
    UPDATE "hsn_codes" SET "taxType_new" = COALESCE("taxTreatment"::TEXT, 'TAXABLE')::"HsnTaxType";
    ALTER TABLE "hsn_codes" DROP COLUMN IF EXISTS "taxType";
    ALTER TABLE "hsn_codes" RENAME COLUMN "taxType_new" TO "taxType";
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hsn_codes' AND column_name = 'taxType'
  ) THEN
    ALTER TABLE "hsn_codes" ALTER COLUMN "taxType" TYPE "HsnTaxType" USING
      CASE
        WHEN "taxType"::TEXT IN ('NIL_RATED') THEN 'NIL_RATED'::"HsnTaxType"
        WHEN "taxType"::TEXT IN ('GST_EXEMPT', 'EXEMPT') THEN 'EXEMPT'::"HsnTaxType"
        WHEN "taxType"::TEXT IN ('NON_GST') THEN 'NON_GST'::"HsnTaxType"
        ELSE 'TAXABLE'::"HsnTaxType"
      END;
  ELSE
    ALTER TABLE "hsn_codes" ADD COLUMN "taxType" "HsnTaxType" NOT NULL DEFAULT 'TAXABLE';
  END IF;
  ALTER TABLE "hsn_codes" ALTER COLUMN "taxType" SET DEFAULT 'TAXABLE';
  ALTER TABLE "hsn_codes" ALTER COLUMN "taxType" SET NOT NULL;
END $$;

ALTER TABLE IF EXISTS "hsn_codes"
  DROP COLUMN IF EXISTS "categoryId",
  DROP COLUMN IF EXISTS "subCategoryId",
  DROP COLUMN IF EXISTS "isDefault",
  DROP COLUMN IF EXISTS "isActive",
  DROP COLUMN IF EXISTS "productType",
  DROP COLUMN IF EXISTS "taxTreatment";

CREATE TABLE IF NOT EXISTS "hsn_rate_history" (
  "id" TEXT NOT NULL,
  "hsnCodeId" TEXT NOT NULL,
  "gstRate" DECIMAL(5,2) NOT NULL,
  "cgstRate" DECIMAL(5,2) NOT NULL,
  "sgstRate" DECIMAL(5,2) NOT NULL,
  "igstRate" DECIMAL(5,2) NOT NULL,
  "cessRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "changeReason" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hsn_rate_history_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hsn_rate_history_hsnCodeId_fkey'
  ) THEN
    ALTER TABLE "hsn_rate_history"
      ADD CONSTRAINT "hsn_rate_history_hsnCodeId_fkey"
      FOREIGN KEY ("hsnCodeId") REFERENCES "hsn_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE IF EXISTS "Product"
  ADD COLUMN IF NOT EXISTS "hsnOverrideEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS "OrderItem"
  ADD COLUMN IF NOT EXISTS "hsnDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "hsnSource" TEXT;

UPDATE "OrderItem"
SET "hsnDescription" = COALESCE("hsnDescription", "hsnDescriptionSnapshot")
WHERE "hsnDescription" IS NULL;

CREATE INDEX IF NOT EXISTS "hsn_codes_code_idx" ON "hsn_codes"("code");
CREATE INDEX IF NOT EXISTS "hsn_codes_description_idx" ON "hsn_codes"("description");
CREATE INDEX IF NOT EXISTS "hsn_codes_chapter_idx" ON "hsn_codes"("chapter");
CREATE INDEX IF NOT EXISTS "hsn_codes_gstRate_idx" ON "hsn_codes"("gstRate");
CREATE INDEX IF NOT EXISTS "hsn_codes_status_idx" ON "hsn_codes"("status");
CREATE INDEX IF NOT EXISTS "hsn_rate_history_hsnCodeId_idx" ON "hsn_rate_history"("hsnCodeId");
CREATE INDEX IF NOT EXISTS "hsn_rate_history_effectiveFrom_idx" ON "hsn_rate_history"("effectiveFrom");

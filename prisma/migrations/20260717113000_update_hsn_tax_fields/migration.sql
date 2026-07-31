DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaxType') THEN
    CREATE TYPE "TaxType" AS ENUM ('CGST_SGST', 'IGST', 'GST_EXEMPT', 'NIL_RATED', 'NON_GST');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductType') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'ProductType' AND e.enumlabel = 'GOODS'
    ) THEN
      ALTER TYPE "ProductType" ADD VALUE 'GOODS';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'ProductType' AND e.enumlabel = 'SERVICE'
    ) THEN
      ALTER TYPE "ProductType" ADD VALUE 'SERVICE';
    END IF;
  END IF;
END $$;

ALTER TABLE "HsnCode"
  ADD COLUMN IF NOT EXISTS "taxType" "TaxType" NOT NULL DEFAULT 'CGST_SGST',
  ADD COLUMN IF NOT EXISTS "productType" "ProductType" NOT NULL DEFAULT 'GOODS';

UPDATE "HsnCode"
SET "taxType" = 'CGST_SGST'
WHERE "taxType" IS NULL;

UPDATE "HsnCode"
SET "productType" = 'GOODS'
WHERE "productType" IS NULL OR "productType"::text NOT IN ('GOODS', 'SERVICE');

ALTER TABLE "HsnCode"
  ALTER COLUMN "taxType" SET DEFAULT 'CGST_SGST',
  ALTER COLUMN "taxType" SET NOT NULL,
  ALTER COLUMN "productType" TYPE "ProductType"
    USING (
      CASE
        WHEN "productType"::text = 'SERVICE' THEN 'SERVICE'
        ELSE 'GOODS'
      END
    )::"ProductType",
  ALTER COLUMN "productType" SET DEFAULT 'GOODS',
  ALTER COLUMN "productType" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "HsnCode_code_idx" ON "HsnCode"("code");
CREATE INDEX IF NOT EXISTS "HsnCode_taxType_idx" ON "HsnCode"("taxType");
CREATE INDEX IF NOT EXISTS "HsnCode_productType_idx" ON "HsnCode"("productType");

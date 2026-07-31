DO $$ BEGIN
  CREATE TYPE "TaxTreatment" AS ENUM ('TAXABLE', 'NIL_RATED', 'EXEMPT', 'NON_GST');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "HsnCode"
  ADD COLUMN IF NOT EXISTS "taxTreatment" "TaxTreatment" NOT NULL DEFAULT 'TAXABLE',
  ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT true;

UPDATE "HsnCode"
SET "taxTreatment" = CASE
  WHEN "taxType"::text = 'GST_EXEMPT' THEN 'EXEMPT'::"TaxTreatment"
  WHEN "taxType"::text = 'NIL_RATED' THEN 'NIL_RATED'::"TaxTreatment"
  WHEN "taxType"::text = 'NON_GST' THEN 'NON_GST'::"TaxTreatment"
  ELSE 'TAXABLE'::"TaxTreatment"
END
WHERE "taxTreatment" = 'TAXABLE';

ALTER TABLE "OrderItem"
  ADD COLUMN IF NOT EXISTS "taxTreatmentSnapshot" "TaxTreatment",
  ADD COLUMN IF NOT EXISTS "hsnDescriptionSnapshot" TEXT;

CREATE INDEX IF NOT EXISTS "HsnCode_isDefault_idx" ON "HsnCode"("isDefault");
CREATE INDEX IF NOT EXISTS "HsnCode_taxTreatment_idx" ON "HsnCode"("taxTreatment");
CREATE INDEX IF NOT EXISTS "OrderItem_taxTreatmentSnapshot_idx" ON "OrderItem"("taxTreatmentSnapshot");

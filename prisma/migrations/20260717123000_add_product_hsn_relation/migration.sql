ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "hsnCodeId" TEXT;

CREATE INDEX IF NOT EXISTS "Product_hsnCodeId_idx" ON "Product"("hsnCodeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Product_hsnCodeId_fkey'
  ) THEN
    ALTER TABLE "Product"
      ADD CONSTRAINT "Product_hsnCodeId_fkey"
      FOREIGN KEY ("hsnCodeId") REFERENCES "HsnCode"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

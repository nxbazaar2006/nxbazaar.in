ALTER TABLE "ProductVariant"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "taxClass" TEXT NOT NULL DEFAULT 'TAXABLE',
  ADD COLUMN IF NOT EXISTS "hsnCodeId" TEXT,
  ADD COLUMN IF NOT EXISTS "gstRate" DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS "reservedStock" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "incomingStock" INTEGER NOT NULL DEFAULT 0;

UPDATE "ProductVariant"
SET "status" = CASE WHEN "isActive" THEN 'ACTIVE' ELSE 'INACTIVE' END
WHERE "status" IS NULL OR "status" = '';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hsn_codes')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVariant_hsnCodeId_fkey') THEN
    ALTER TABLE "ProductVariant"
      ADD CONSTRAINT "ProductVariant_hsnCodeId_fkey"
      FOREIGN KEY ("hsnCodeId") REFERENCES "hsn_codes"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ProductVariant_status_idx" ON "ProductVariant"("status");
CREATE INDEX IF NOT EXISTS "ProductVariant_isActive_idx" ON "ProductVariant"("isActive");
CREATE INDEX IF NOT EXISTS "ProductVariant_hsnCodeId_idx" ON "ProductVariant"("hsnCodeId");
CREATE INDEX IF NOT EXISTS "ProductVariant_taxClass_idx" ON "ProductVariant"("taxClass");

CREATE TABLE IF NOT EXISTS "VariantInventory" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "warehouseCode" TEXT NOT NULL,
  "warehouseName" TEXT,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "reservedStock" INTEGER NOT NULL DEFAULT 0,
  "incomingStock" INTEGER NOT NULL DEFAULT 0,
  "lowStockAt" INTEGER NOT NULL DEFAULT 5,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VariantInventory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VariantImage" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "altText" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VariantImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VariantHistory" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "field" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "quantity" INTEGER,
  "note" TEXT,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VariantHistory_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VariantInventory_variantId_fkey') THEN
    ALTER TABLE "VariantInventory"
      ADD CONSTRAINT "VariantInventory_variantId_fkey"
      FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VariantImage_variantId_fkey') THEN
    ALTER TABLE "VariantImage"
      ADD CONSTRAINT "VariantImage_variantId_fkey"
      FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VariantHistory_variantId_fkey') THEN
    ALTER TABLE "VariantHistory"
      ADD CONSTRAINT "VariantHistory_variantId_fkey"
      FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "VariantInventory_variantId_warehouseCode_key"
  ON "VariantInventory"("variantId", "warehouseCode");
CREATE INDEX IF NOT EXISTS "VariantInventory_variantId_idx" ON "VariantInventory"("variantId");
CREATE INDEX IF NOT EXISTS "VariantInventory_warehouseCode_idx" ON "VariantInventory"("warehouseCode");
CREATE INDEX IF NOT EXISTS "VariantImage_variantId_idx" ON "VariantImage"("variantId");
CREATE INDEX IF NOT EXISTS "VariantImage_isPrimary_idx" ON "VariantImage"("isPrimary");
CREATE INDEX IF NOT EXISTS "VariantHistory_variantId_idx" ON "VariantHistory"("variantId");
CREATE INDEX IF NOT EXISTS "VariantHistory_action_idx" ON "VariantHistory"("action");
CREATE INDEX IF NOT EXISTS "VariantHistory_createdAt_idx" ON "VariantHistory"("createdAt");

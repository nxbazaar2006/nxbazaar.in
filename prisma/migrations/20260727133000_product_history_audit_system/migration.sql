-- Product code is now mandatory for audit snapshots. Backfill legacy rows before NOT NULL.
WITH numbered_products AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn
  FROM "Product"
  WHERE "productCode" IS NULL OR "productCode" = ''
)
UPDATE "Product" AS p
SET "productCode" = 'NX-LEGACY-' || LPAD(numbered_products.rn::text, 6, '0')
FROM numbered_products
WHERE p."id" = numbered_products."id";

ALTER TABLE "Product" ALTER COLUMN "productCode" SET NOT NULL;

CREATE TYPE "ProductHistoryAction" AS ENUM (
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_DELETED',
  'PRODUCT_RESTORED',
  'PRODUCT_ACTIVATED',
  'PRODUCT_DEACTIVATED',
  'VARIANT_CREATED',
  'VARIANT_UPDATED',
  'VARIANT_DELETED',
  'PRICE_CHANGED',
  'STOCK_CHANGED',
  'CATEGORY_CHANGED',
  'SUBCATEGORY_CHANGED',
  'SKU_GENERATED',
  'BARCODE_GENERATED',
  'AI_DRAFT_APPLIED',
  'BULK_UPDATE'
);

ALTER TABLE "ProductHistory" ADD COLUMN IF NOT EXISTS "productTitle" TEXT;
ALTER TABLE "ProductHistory" ADD COLUMN IF NOT EXISTS "productCode" TEXT;
ALTER TABLE "ProductHistory" ADD COLUMN IF NOT EXISTS "barcode" TEXT;
ALTER TABLE "ProductHistory" ADD COLUMN IF NOT EXISTS "changedByUserCode" TEXT;
ALTER TABLE "ProductHistory" ADD COLUMN IF NOT EXISTS "changedByName" TEXT;
ALTER TABLE "ProductHistory" ADD COLUMN IF NOT EXISTS "sellerId" TEXT;
ALTER TABLE "ProductHistory" ADD COLUMN IF NOT EXISTS "note" TEXT;

UPDATE "ProductHistory" AS h
SET
  "productTitle" = COALESCE(h."productTitle", p."title"),
  "productCode" = COALESCE(h."productCode", p."productCode"),
  "sellerId" = COALESCE(h."sellerId", p."userId")
FROM "Product" AS p
WHERE h."productId" = p."id";

UPDATE "ProductHistory" AS h
SET "barcode" = COALESCE(h."barcode", v."barcode")
FROM "ProductVariant" AS v
WHERE h."variantId" = v."id";

ALTER TABLE "ProductHistory" ALTER COLUMN "productTitle" SET NOT NULL;

UPDATE "ProductHistory"
SET "action" = CASE "action"
  WHEN 'CATEGORY_ASSIGNED' THEN 'CATEGORY_CHANGED'
  WHEN 'SUBCATEGORY_ASSIGNED' THEN 'SUBCATEGORY_CHANGED'
  WHEN 'HSN_ASSIGNED' THEN 'PRODUCT_UPDATED'
  WHEN 'HSN_CHANGED' THEN 'PRODUCT_UPDATED'
  WHEN 'PRODUCT_TYPE_CHANGED' THEN 'PRODUCT_UPDATED'
  WHEN 'ATTRIBUTE_UPDATED' THEN 'PRODUCT_UPDATED'
  WHEN 'VARIANT_PRICE_CHANGED' THEN 'PRICE_CHANGED'
  WHEN 'VARIANT_STOCK_CHANGED' THEN 'STOCK_CHANGED'
  WHEN 'DEFAULT_VARIANT_CHANGED' THEN 'VARIANT_UPDATED'
  WHEN 'VARIANT_ACTIVATED' THEN 'VARIANT_UPDATED'
  WHEN 'VARIANT_DEACTIVATED' THEN 'VARIANT_UPDATED'
  WHEN 'AI_DRAFT_RESTORED' THEN 'PRODUCT_RESTORED'
  ELSE "action"
END;

ALTER TABLE "ProductHistory"
  ALTER COLUMN "oldValue" TYPE JSONB USING CASE WHEN "oldValue" IS NULL THEN NULL ELSE to_jsonb("oldValue") END,
  ALTER COLUMN "newValue" TYPE JSONB USING CASE WHEN "newValue" IS NULL THEN NULL ELSE to_jsonb("newValue") END;

ALTER TABLE "ProductHistory"
  ALTER COLUMN "action" TYPE "ProductHistoryAction" USING "action"::"ProductHistoryAction";

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.table_name = 'ProductHistory'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'variantId'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "ProductHistory" DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

DROP INDEX IF EXISTS "ProductHistory_variantId_idx";
CREATE INDEX IF NOT EXISTS "ProductHistory_variantId_idx" ON "ProductHistory"("variantId");
CREATE INDEX IF NOT EXISTS "ProductHistory_sku_idx" ON "ProductHistory"("sku");
CREATE INDEX IF NOT EXISTS "ProductHistory_barcode_idx" ON "ProductHistory"("barcode");
CREATE INDEX IF NOT EXISTS "ProductHistory_sellerId_idx" ON "ProductHistory"("sellerId");
CREATE INDEX IF NOT EXISTS "ProductHistory_action_idx" ON "ProductHistory"("action");
CREATE INDEX IF NOT EXISTS "ProductHistory_createdAt_idx" ON "ProductHistory"("createdAt");

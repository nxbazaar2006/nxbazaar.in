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

CREATE TABLE "ProductHistory" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productTitle" TEXT NOT NULL,
  "productCode" TEXT,
  "variantId" TEXT,
  "sku" TEXT,
  "barcode" TEXT,
  "action" "ProductHistoryAction" NOT NULL,
  "field" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "changedByUserId" TEXT,
  "changedByUserCode" TEXT,
  "changedByName" TEXT,
  "changedByRole" TEXT,
  "sellerId" TEXT,
  "sellerCode" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductHistory"
ADD CONSTRAINT "ProductHistory_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ProductHistory_productId_idx" ON "ProductHistory"("productId");
CREATE INDEX "ProductHistory_variantId_idx" ON "ProductHistory"("variantId");
CREATE INDEX "ProductHistory_sku_idx" ON "ProductHistory"("sku");
CREATE INDEX "ProductHistory_barcode_idx" ON "ProductHistory"("barcode");
CREATE INDEX "ProductHistory_sellerId_idx" ON "ProductHistory"("sellerId");
CREATE INDEX "ProductHistory_action_idx" ON "ProductHistory"("action");
CREATE INDEX "ProductHistory_createdAt_idx" ON "ProductHistory"("createdAt");

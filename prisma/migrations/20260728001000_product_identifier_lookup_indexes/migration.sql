CREATE UNIQUE INDEX IF NOT EXISTS "Product_productCode_key"
ON "Product"("productCode");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_sku_key"
ON "ProductVariant"("sku");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_barcode_key"
ON "ProductVariant"("barcode");

CREATE INDEX IF NOT EXISTS "ProductHistory_productCode_idx"
ON "ProductHistory"("productCode");

CREATE INDEX IF NOT EXISTS "ProductHistory_sku_idx"
ON "ProductHistory"("sku");

CREATE INDEX IF NOT EXISTS "ProductHistory_barcode_idx"
ON "ProductHistory"("barcode");

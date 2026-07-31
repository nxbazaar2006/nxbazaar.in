DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductType') THEN
    CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'VARIABLE');
  END IF;
END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "productType" "ProductType" NOT NULL DEFAULT 'SIMPLE';

CREATE TABLE IF NOT EXISTS "ProductAttribute" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "isVariant" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductAttributeValue" (
  "id" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "colorCode" TEXT,
  "imageUrl" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductVariantAttributeValue" (
  "id" TEXT NOT NULL,
  "productVariantId" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "attributeValueId" TEXT NOT NULL,
  CONSTRAINT "ProductVariantAttributeValue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductAttribute_productId_slug_key"
  ON "ProductAttribute"("productId", "slug");
CREATE INDEX IF NOT EXISTS "ProductAttribute_productId_idx"
  ON "ProductAttribute"("productId");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductAttributeValue_attributeId_slug_key"
  ON "ProductAttributeValue"("attributeId", "slug");
CREATE INDEX IF NOT EXISTS "ProductAttributeValue_attributeId_idx"
  ON "ProductAttributeValue"("attributeId");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariantAttributeValue_productVariantId_attributeId_key"
  ON "ProductVariantAttributeValue"("productVariantId", "attributeId");
CREATE INDEX IF NOT EXISTS "ProductVariantAttributeValue_productVariantId_idx"
  ON "ProductVariantAttributeValue"("productVariantId");
CREATE INDEX IF NOT EXISTS "ProductVariantAttributeValue_attributeId_idx"
  ON "ProductVariantAttributeValue"("attributeId");
CREATE INDEX IF NOT EXISTS "ProductVariantAttributeValue_attributeValueId_idx"
  ON "ProductVariantAttributeValue"("attributeValueId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductAttribute_productId_fkey'
  ) THEN
    ALTER TABLE "ProductAttribute"
      ADD CONSTRAINT "ProductAttribute_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductAttributeValue_attributeId_fkey'
  ) THEN
    ALTER TABLE "ProductAttributeValue"
      ADD CONSTRAINT "ProductAttributeValue_attributeId_fkey"
      FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductVariantAttributeValue_productVariantId_fkey'
  ) THEN
    ALTER TABLE "ProductVariantAttributeValue"
      ADD CONSTRAINT "ProductVariantAttributeValue_productVariantId_fkey"
      FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductVariantAttributeValue_attributeId_fkey'
  ) THEN
    ALTER TABLE "ProductVariantAttributeValue"
      ADD CONSTRAINT "ProductVariantAttributeValue_attributeId_fkey"
      FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductVariantAttributeValue_attributeValueId_fkey'
  ) THEN
    ALTER TABLE "ProductVariantAttributeValue"
      ADD CONSTRAINT "ProductVariantAttributeValue_attributeValueId_fkey"
      FOREIGN KEY ("attributeValueId") REFERENCES "ProductAttributeValue"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "OrderItem"
  ADD COLUMN IF NOT EXISTS "selectedAttributes" JSONB;

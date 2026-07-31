DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LanguageCode') THEN
    CREATE TYPE "LanguageCode" AS ENUM ('en', 'hi', 'mr');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TranslationEntityType') THEN
    CREATE TYPE "TranslationEntityType" AS ENUM ('PRODUCT', 'CATEGORY', 'SUBCATEGORY', 'BRAND', 'ATTRIBUTE', 'ATTRIBUTE_VALUE', 'BLOG', 'BANNER', 'PAGE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TranslationJobStatus') THEN
    CREATE TYPE "TranslationJobStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED');
  END IF;
END $$;

ALTER TABLE "CategoryTranslation"
  ADD COLUMN IF NOT EXISTS "sourceHash" TEXT,
  ADD COLUMN IF NOT EXISTS "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "translatedAt" TIMESTAMP(3);

ALTER TABLE "SubCategoryTranslation"
  ADD COLUMN IF NOT EXISTS "sourceHash" TEXT,
  ADD COLUMN IF NOT EXISTS "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "translatedAt" TIMESTAMP(3);

ALTER TABLE "ProductTranslation"
  ADD COLUMN IF NOT EXISTS "sourceHash" TEXT,
  ADD COLUMN IF NOT EXISTS "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "translatedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "BrandTranslation" (
  "id" TEXT NOT NULL,
  "brandId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "sourceHash" TEXT,
  "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  "translatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BrandTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BannerTranslation" (
  "id" TEXT NOT NULL,
  "bannerId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "link" TEXT,
  "sourceHash" TEXT,
  "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  "translatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BannerTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttributeTranslation" (
  "id" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sourceHash" TEXT,
  "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  "translatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttributeTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttributeValueTranslation" (
  "id" TEXT NOT NULL,
  "attributeValueId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sourceHash" TEXT,
  "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  "translatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttributeValueTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TrainingTranslation" (
  "id" TEXT NOT NULL,
  "trainingId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT,
  "sourceHash" TEXT,
  "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
  "isManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
  "translatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrainingTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TranslationJob" (
  "id" TEXT NOT NULL,
  "queueJobId" TEXT,
  "entityType" "TranslationEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceLanguage" "LanguageCode" NOT NULL DEFAULT 'en',
  "targetLanguage" "LanguageCode" NOT NULL,
  "sourceHash" TEXT NOT NULL,
  "status" "TranslationJobStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "requestedById" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TranslationJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BrandTranslation_brandId_language_key" ON "BrandTranslation"("brandId", "language");
CREATE UNIQUE INDEX IF NOT EXISTS "BrandTranslation_language_slug_key" ON "BrandTranslation"("language", "slug");
CREATE INDEX IF NOT EXISTS "BrandTranslation_language_idx" ON "BrandTranslation"("language");
CREATE INDEX IF NOT EXISTS "BrandTranslation_slug_idx" ON "BrandTranslation"("slug");
CREATE INDEX IF NOT EXISTS "BrandTranslation_brandId_idx" ON "BrandTranslation"("brandId");

CREATE UNIQUE INDEX IF NOT EXISTS "BannerTranslation_bannerId_language_key" ON "BannerTranslation"("bannerId", "language");
CREATE UNIQUE INDEX IF NOT EXISTS "BannerTranslation_language_slug_key" ON "BannerTranslation"("language", "slug");
CREATE INDEX IF NOT EXISTS "BannerTranslation_language_idx" ON "BannerTranslation"("language");
CREATE INDEX IF NOT EXISTS "BannerTranslation_slug_idx" ON "BannerTranslation"("slug");
CREATE INDEX IF NOT EXISTS "BannerTranslation_bannerId_idx" ON "BannerTranslation"("bannerId");

CREATE UNIQUE INDEX IF NOT EXISTS "AttributeTranslation_attributeId_language_key" ON "AttributeTranslation"("attributeId", "language");
CREATE UNIQUE INDEX IF NOT EXISTS "AttributeTranslation_language_slug_key" ON "AttributeTranslation"("language", "slug");
CREATE INDEX IF NOT EXISTS "AttributeTranslation_language_idx" ON "AttributeTranslation"("language");
CREATE INDEX IF NOT EXISTS "AttributeTranslation_slug_idx" ON "AttributeTranslation"("slug");
CREATE INDEX IF NOT EXISTS "AttributeTranslation_attributeId_idx" ON "AttributeTranslation"("attributeId");

CREATE UNIQUE INDEX IF NOT EXISTS "AttributeValueTranslation_attributeValueId_language_key" ON "AttributeValueTranslation"("attributeValueId", "language");
CREATE UNIQUE INDEX IF NOT EXISTS "AttributeValueTranslation_language_slug_key" ON "AttributeValueTranslation"("language", "slug");
CREATE INDEX IF NOT EXISTS "AttributeValueTranslation_language_idx" ON "AttributeValueTranslation"("language");
CREATE INDEX IF NOT EXISTS "AttributeValueTranslation_slug_idx" ON "AttributeValueTranslation"("slug");
CREATE INDEX IF NOT EXISTS "AttributeValueTranslation_attributeValueId_idx" ON "AttributeValueTranslation"("attributeValueId");

CREATE UNIQUE INDEX IF NOT EXISTS "TrainingTranslation_trainingId_language_key" ON "TrainingTranslation"("trainingId", "language");
CREATE UNIQUE INDEX IF NOT EXISTS "TrainingTranslation_language_slug_key" ON "TrainingTranslation"("language", "slug");
CREATE INDEX IF NOT EXISTS "TrainingTranslation_language_idx" ON "TrainingTranslation"("language");
CREATE INDEX IF NOT EXISTS "TrainingTranslation_slug_idx" ON "TrainingTranslation"("slug");
CREATE INDEX IF NOT EXISTS "TrainingTranslation_trainingId_idx" ON "TrainingTranslation"("trainingId");

CREATE UNIQUE INDEX IF NOT EXISTS "TranslationJob_queueJobId_key" ON "TranslationJob"("queueJobId");
CREATE UNIQUE INDEX IF NOT EXISTS "TranslationJob_entityType_entityId_targetLanguage_sourceHash_key" ON "TranslationJob"("entityType", "entityId", "targetLanguage", "sourceHash");
CREATE INDEX IF NOT EXISTS "TranslationJob_status_idx" ON "TranslationJob"("status");
CREATE INDEX IF NOT EXISTS "TranslationJob_entityType_entityId_idx" ON "TranslationJob"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "TranslationJob_createdAt_idx" ON "TranslationJob"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BrandTranslation_brandId_fkey') THEN
    ALTER TABLE "BrandTranslation" ADD CONSTRAINT "BrandTranslation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BannerTranslation_bannerId_fkey') THEN
    ALTER TABLE "BannerTranslation" ADD CONSTRAINT "BannerTranslation_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AttributeTranslation_attributeId_fkey') THEN
    ALTER TABLE "AttributeTranslation" ADD CONSTRAINT "AttributeTranslation_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AttributeValueTranslation_attributeValueId_fkey') THEN
    ALTER TABLE "AttributeValueTranslation" ADD CONSTRAINT "AttributeValueTranslation_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "AttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TrainingTranslation_trainingId_fkey') THEN
    ALTER TABLE "TrainingTranslation" ADD CONSTRAINT "TrainingTranslation_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

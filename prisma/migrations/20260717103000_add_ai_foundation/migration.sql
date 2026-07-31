ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "aiConfidence" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "aiMetadata" JSONB;

CREATE TABLE IF NOT EXISTS "AIRequestLog" (
  "id" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "userId" TEXT,
  "userRole" TEXT,
  "requestHash" TEXT,
  "promptTokens" INTEGER,
  "outputTokens" INTEGER,
  "latencyMs" INTEGER,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIRequestLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductView" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "source" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SearchHistory" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "query" TEXT NOT NULL,
  "normalized" TEXT NOT NULL,
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "filters" JSONB,
  "aiEnhanced" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductRecommendation" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "productId" TEXT NOT NULL,
  "recommendedProductId" TEXT NOT NULL,
  "reason" TEXT,
  "score" DOUBLE PRECISION,
  "source" TEXT NOT NULL,
  "metadata" JSONB,
  "clickedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AIRequestLog_feature_idx" ON "AIRequestLog"("feature");
CREATE INDEX IF NOT EXISTS "AIRequestLog_status_idx" ON "AIRequestLog"("status");
CREATE INDEX IF NOT EXISTS "AIRequestLog_userId_idx" ON "AIRequestLog"("userId");
CREATE INDEX IF NOT EXISTS "AIRequestLog_createdAt_idx" ON "AIRequestLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ProductView_productId_idx" ON "ProductView"("productId");
CREATE INDEX IF NOT EXISTS "ProductView_userId_idx" ON "ProductView"("userId");
CREATE INDEX IF NOT EXISTS "ProductView_createdAt_idx" ON "ProductView"("createdAt");
CREATE INDEX IF NOT EXISTS "SearchHistory_userId_idx" ON "SearchHistory"("userId");
CREATE INDEX IF NOT EXISTS "SearchHistory_normalized_idx" ON "SearchHistory"("normalized");
CREATE INDEX IF NOT EXISTS "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");
CREATE INDEX IF NOT EXISTS "ProductRecommendation_userId_idx" ON "ProductRecommendation"("userId");
CREATE INDEX IF NOT EXISTS "ProductRecommendation_productId_idx" ON "ProductRecommendation"("productId");
CREATE INDEX IF NOT EXISTS "ProductRecommendation_recommendedProductId_idx" ON "ProductRecommendation"("recommendedProductId");
CREATE INDEX IF NOT EXISTS "ProductRecommendation_createdAt_idx" ON "ProductRecommendation"("createdAt");

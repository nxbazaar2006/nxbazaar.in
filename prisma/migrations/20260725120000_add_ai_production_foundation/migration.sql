CREATE TABLE IF NOT EXISTS "AiConversation" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userRole" TEXT,
  "feature" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "title" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AiMessage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "redacted" BOOLEAN NOT NULL DEFAULT true,
  "citations" JSONB,
  "metadata" JSONB,
  "promptTokens" INTEGER,
  "outputTokens" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AiUsage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT,
  "userId" TEXT,
  "userRole" TEXT,
  "feature" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "promptTokens" INTEGER,
  "outputTokens" INTEGER,
  "totalTokens" INTEGER,
  "latencyMs" INTEGER,
  "requestHash" TEXT,
  "errorCode" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AiGeneration" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userRole" TEXT,
  "feature" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "inputHash" TEXT,
  "promptVersion" TEXT,
  "provider" TEXT,
  "model" TEXT,
  "generatedJson" JSONB NOT NULL,
  "reviewedJson" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AiFeedback" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT,
  "messageId" TEXT,
  "userId" TEXT,
  "rating" TEXT NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductSearchLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "query" TEXT NOT NULL,
  "normalizedQuery" TEXT NOT NULL,
  "language" TEXT,
  "extractedFilters" JSONB,
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "zeroResults" BOOLEAN NOT NULL DEFAULT false,
  "aiEnhanced" BOOLEAN NOT NULL DEFAULT false,
  "searchMode" TEXT NOT NULL DEFAULT 'keyword',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductSearchLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AiInsight" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userRole" TEXT,
  "scope" TEXT NOT NULL,
  "insightType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "severity" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiMessage_conversationId_fkey') THEN
    ALTER TABLE "AiMessage"
      ADD CONSTRAINT "AiMessage_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiUsage_conversationId_fkey') THEN
    ALTER TABLE "AiUsage"
      ADD CONSTRAINT "AiUsage_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiFeedback_conversationId_fkey') THEN
    ALTER TABLE "AiFeedback"
      ADD CONSTRAINT "AiFeedback_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiFeedback_messageId_fkey') THEN
    ALTER TABLE "AiFeedback"
      ADD CONSTRAINT "AiFeedback_messageId_fkey"
      FOREIGN KEY ("messageId") REFERENCES "AiMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "AiConversation_userId_idx" ON "AiConversation"("userId");
CREATE INDEX IF NOT EXISTS "AiConversation_feature_idx" ON "AiConversation"("feature");
CREATE INDEX IF NOT EXISTS "AiConversation_scope_idx" ON "AiConversation"("scope");
CREATE INDEX IF NOT EXISTS "AiConversation_status_idx" ON "AiConversation"("status");
CREATE INDEX IF NOT EXISTS "AiConversation_createdAt_idx" ON "AiConversation"("createdAt");

CREATE INDEX IF NOT EXISTS "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");
CREATE INDEX IF NOT EXISTS "AiMessage_role_idx" ON "AiMessage"("role");
CREATE INDEX IF NOT EXISTS "AiMessage_createdAt_idx" ON "AiMessage"("createdAt");

CREATE INDEX IF NOT EXISTS "AiUsage_conversationId_idx" ON "AiUsage"("conversationId");
CREATE INDEX IF NOT EXISTS "AiUsage_userId_idx" ON "AiUsage"("userId");
CREATE INDEX IF NOT EXISTS "AiUsage_feature_idx" ON "AiUsage"("feature");
CREATE INDEX IF NOT EXISTS "AiUsage_status_idx" ON "AiUsage"("status");
CREATE INDEX IF NOT EXISTS "AiUsage_createdAt_idx" ON "AiUsage"("createdAt");

CREATE INDEX IF NOT EXISTS "AiGeneration_userId_idx" ON "AiGeneration"("userId");
CREATE INDEX IF NOT EXISTS "AiGeneration_feature_idx" ON "AiGeneration"("feature");
CREATE INDEX IF NOT EXISTS "AiGeneration_entityType_entityId_idx" ON "AiGeneration"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AiGeneration_status_idx" ON "AiGeneration"("status");
CREATE INDEX IF NOT EXISTS "AiGeneration_createdAt_idx" ON "AiGeneration"("createdAt");

CREATE INDEX IF NOT EXISTS "AiFeedback_conversationId_idx" ON "AiFeedback"("conversationId");
CREATE INDEX IF NOT EXISTS "AiFeedback_messageId_idx" ON "AiFeedback"("messageId");
CREATE INDEX IF NOT EXISTS "AiFeedback_userId_idx" ON "AiFeedback"("userId");
CREATE INDEX IF NOT EXISTS "AiFeedback_rating_idx" ON "AiFeedback"("rating");
CREATE INDEX IF NOT EXISTS "AiFeedback_createdAt_idx" ON "AiFeedback"("createdAt");

CREATE INDEX IF NOT EXISTS "ProductSearchLog_userId_idx" ON "ProductSearchLog"("userId");
CREATE INDEX IF NOT EXISTS "ProductSearchLog_normalizedQuery_idx" ON "ProductSearchLog"("normalizedQuery");
CREATE INDEX IF NOT EXISTS "ProductSearchLog_zeroResults_idx" ON "ProductSearchLog"("zeroResults");
CREATE INDEX IF NOT EXISTS "ProductSearchLog_aiEnhanced_idx" ON "ProductSearchLog"("aiEnhanced");
CREATE INDEX IF NOT EXISTS "ProductSearchLog_createdAt_idx" ON "ProductSearchLog"("createdAt");

CREATE INDEX IF NOT EXISTS "AiInsight_userId_idx" ON "AiInsight"("userId");
CREATE INDEX IF NOT EXISTS "AiInsight_scope_idx" ON "AiInsight"("scope");
CREATE INDEX IF NOT EXISTS "AiInsight_insightType_idx" ON "AiInsight"("insightType");
CREATE INDEX IF NOT EXISTS "AiInsight_status_idx" ON "AiInsight"("status");
CREATE INDEX IF NOT EXISTS "AiInsight_createdAt_idx" ON "AiInsight"("createdAt");

CREATE INDEX IF NOT EXISTS "Product_ai_full_text_idx"
  ON "Product"
  USING GIN (
    to_tsvector(
      'simple',
      coalesce("title", '') || ' ' ||
      coalesce("description", '') || ' ' ||
      array_to_string("tags", ' ')
    )
  );

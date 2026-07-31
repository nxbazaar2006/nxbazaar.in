-- Add a vendor code source for generated product codes.
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "code" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "SellerProfile_code_key" ON "SellerProfile"("code");

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { authorizeCredentialsUser, type CredentialsUserRecord } from "@/lib/auth-credentials";
import { canCredentialsUserSignIn, getCredentialsRejectionReason, normalizeCredentialEmail } from "@/lib/auth-policy";
import { aiProductGeneratedDraftSchema } from "@/lib/ai/validators";

const root = process.cwd();

function source(file: string) {
  return readFileSync(join(root, file), "utf8");
}

async function makeUser(overrides: Partial<CredentialsUserRecord> = {}): Promise<CredentialsUserRecord> {
  return {
    id: overrides.id ?? "user-1",
    name: overrides.name ?? "Test User",
    email: overrides.email ?? "seller@example.com",
    password: overrides.password ?? (await bcrypt.hash("correct-password", 4)),
    role: overrides.role ?? "SELLER",
    status: overrides.status ?? true,
    emailVerified: overrides.emailVerified ?? true,
  };
}

describe("Auth.js v5 credentials policy", () => {
  it("normalizes submitted email", () => {
    assert.equal(normalizeCredentialEmail(" Seller@Example.COM "), "seller@example.com");
  });

  it("rejects unknown email without disclosing account existence", async () => {
    const result = await authorizeCredentialsUser({ email: "missing@example.com", password: "correct-password" }, async () => null);
    assert.equal(result, null);
  });

  it("rejects wrong password", async () => {
    const user = await makeUser();
    const result = await authorizeCredentialsUser({ email: "seller@example.com", password: "wrong-password" }, async () => user);
    assert.equal(result, null);
  });

  it("rejects inactive account", async () => {
    const user = await makeUser({ status: false });
    assert.equal(canCredentialsUserSignIn(user), false);
    assert.equal(getCredentialsRejectionReason(user), "inactive_account");
  });

  it("rejects unverified seller", async () => {
    const user = await makeUser({ role: "SELLER", emailVerified: false });
    const result = await authorizeCredentialsUser({ email: "seller@example.com", password: "correct-password" }, async () => user);
    assert.equal(result, null);
    assert.equal(getCredentialsRejectionReason(user), "email_verification_required");
  });

  it("accepts verified active seller and propagates role fields", async () => {
    const user = await makeUser({ role: "SELLER", emailVerified: true, status: true });
    const result = await authorizeCredentialsUser({ email: "SELLER@example.com", password: "correct-password" }, async (email) =>
      email === "seller@example.com" ? user : null
    );
    assert.equal(result?.id, user.id);
    assert.equal(result?.email, user.email);
    assert.equal(result?.role, "SELLER");
    assert.equal(result?.status, true);
    assert.equal(result?.emailVerified, true);
  });

  it("accepts active USER according to current USER verification policy", async () => {
    const user = await makeUser({ role: "USER", emailVerified: false, status: true, email: "user@example.com" });
    const result = await authorizeCredentialsUser({ email: "user@example.com", password: "correct-password" }, async () => user);
    assert.equal(result?.role, "USER");
    assert.equal(result?.emailVerified, false);
  });

  it("keeps id, email, role, status and emailVerified in session callback source", () => {
    const authSource = source("auth.ts");
    for (const field of ["session.user.id", "session.user.email", "session.user.role", "session.user.status", "session.user.emailVerified"]) {
      assert.match(authSource, new RegExp(field.replaceAll(".", "\\.")));
    }
  });
});

describe("AI MVP authorization and draft safety", () => {
  it("admin insights allows admin and moderator only", () => {
    const route = source("app/api/ai/admin-insights/route.ts");
    assert.match(route, /auth\(\)/);
    assert.match(route, /\["ADMIN", "MODERATOR"\]/);
    assert.match(route, /forbidden\(\)/);
  });

  it("seller assistant scopes data to session identity", () => {
    const route = source("app/api/ai/seller-assistant/route.ts");
    assert.match(route, /auth\(\)/);
    assert.match(route, /userId: session\.user\.id/);
    assert.match(route, /vendorId: session\.user\.id/);
  });

  it("feedback validates conversation or message ownership", () => {
    const route = source("app/api/ai/feedback/route.ts");
    assert.match(route, /conversation\.userId !== session\.user\.id/);
    assert.match(route, /message\.conversation\.userId !== session\.user\.id/);
  });

  it("AI disabled fallback is implemented for assistant and product generation", () => {
    assert.match(source("app/api/ai/shopping-assistant/route.ts"), /fallbackAnswer/);
    assert.match(source("app/api/ai/product-generate/route.ts"), /fallbackDraft/);
  });

  it("AI product draft route does not save Product records", () => {
    const route = source("app/api/ai/product-generate/route.ts");
    assert.doesNotMatch(route, /db\.product\.(create|update|upsert)/);
    assert.match(route, /AiGeneration/);
    assert.match(route, /Nothing was saved to the product record/);
  });

  it("malformed AI product draft response fails validation", () => {
    assert.equal(aiProductGeneratedDraftSchema.safeParse({ title: "" }).success, false);
    assert.equal(aiProductGeneratedDraftSchema.safeParse({ title: "Valid title", keywords: ["tag"] }).success, true);
  });

  it("product form shows HSN/GST manual-review warning for AI drafts", () => {
    const form = source("components/backoffice/NewProductForm.tsx");
    const button = source("components/ai/AiGenerateButton.tsx");
    assert.match(form + button, /HSN\/GST mapping needs manual review before publishing or invoicing\./);
    assert.match(form, /setValue\("isActive", false/);
  });
});

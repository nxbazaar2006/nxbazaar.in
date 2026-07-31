import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  canAccessDashboardPath,
  canAccessUserResource,
  checkRateLimit,
  clearRateLimitStore,
  isPublicRegistrationRole,
  sanitizeUser,
} from "../lib/security";

const root = process.cwd();

function source(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("security helpers", () => {
  it("allows only safe public registration roles", () => {
    assert.equal(isPublicRegistrationRole("USER"), true);
    assert.equal(isPublicRegistrationRole("FARMER"), true);
    assert.equal(isPublicRegistrationRole("ADMIN"), false);
    assert.equal(isPublicRegistrationRole("MODERATOR"), false);
  });

  it("enforces owner-or-admin user access", () => {
    assert.equal(canAccessUserResource({ expires: "", user: { id: "u1", role: "USER" } }, "u1"), true);
    assert.equal(canAccessUserResource({ expires: "", user: { id: "u1", role: "USER" } }, "u2"), false);
    assert.equal(canAccessUserResource({ expires: "", user: { id: "a1", role: "ADMIN" } }, "u2"), true);
  });

  it("enforces dashboard role boundaries", () => {
    assert.equal(canAccessDashboardPath("USER", "/dashboard/orders"), true);
    assert.equal(canAccessDashboardPath("USER", "/dashboard/staff"), false);
    assert.equal(canAccessDashboardPath("FARMER", "/dashboard/products"), true);
    assert.equal(canAccessDashboardPath("FARMER", "/dashboard/customers"), false);
    assert.equal(canAccessDashboardPath("ADMIN", "/dashboard/customers"), true);
  });

  it("removes password and verification token from user responses", () => {
    assert.deepEqual(
      sanitizeUser({ id: "u1", email: "a@example.com", password: "secret", verificationToken: "token" }),
      { id: "u1", email: "a@example.com" }
    );
  });

  it("rate limits repeated sensitive requests", () => {
    clearRateLimitStore();
    assert.equal(checkRateLimit("reset:1", { limit: 2, windowMs: 1000 }, 100).ok, true);
    assert.equal(checkRateLimit("reset:1", { limit: 2, windowMs: 1000 }, 200).ok, true);
    assert.equal(checkRateLimit("reset:1", { limit: 2, windowMs: 1000 }, 300).ok, false);
    assert.equal(checkRateLimit("reset:1", { limit: 2, windowMs: 1000 }, 1200).ok, true);
  });
});

describe("security route guards", () => {
  it("protects admin-only and owner-scoped APIs", () => {
    for (const file of [
      "app/api/staffs/route.tsx",
      "app/api/users/route.tsx",
      "app/api/customers/route.tsx",
      "app/api/categories/route.tsx",
      "app/api/banners/route.tsx",
      "app/api/markets/route.tsx",
      "app/api/farmers/route.tsx",
      "app/api/subcategories/route.tsx",
      "app/api/trainings/route.tsx",
      "app/api/hsn-codes/route.tsx",
    ]) {
      assert.match(source(file), /auth\(\)/, file);
      assert.match(source(file), /assertAdmin|assertAuthenticated/, file);
    }
  });

  it("requires tokens for account verification and password reset", () => {
    assert.match(source("app/api/users/verify/route.tsx"), /verificationToken: token/);
    assert.match(source("app/api/users/update-password/route.tsx"), /verificationToken: token/);
    assert.match(source("app/api/users/forgot-password/route.tsx"), /verificationToken: token/);
    assert.match(source("components/ResetPasswordForm.tsx"), /data\.token = token/);
  });

  it("derives checkout user id from the session", () => {
    const ordersRoute = source("app/api/orders/route.tsx");
    assert.match(ordersRoute, /auth\(\)/);
    assert.match(ordersRoute, /const userId = session\.user\.id/);
    assert.doesNotMatch(ordersRoute, /userId,\\s*\\n\\s*}\\s*=\\s*checkoutFormData/);
  });

  it("scopes seller sales and coupon access", () => {
    assert.match(source("app/api/sales/route.tsx"), /vendorId: session\.user\.id/);
    assert.match(source("app/api/coupons/route.tsx"), /resolvedVendorId/);
    assert.match(source("app/api/coupons/[id]/route.tsx"), /existingCoupon\.vendorId !== session\.user\.id/);
  });

  it("requires authenticated Uploadthing metadata", () => {
    const uploadCore = source("app/api/uploadthing/core.tsx");
    assert.match(uploadCore, /requireUploadSession/);
    assert.match(uploadCore, /\.middleware\(requireUploadSession\)/);
    assert.doesNotMatch(uploadCore, /uploadedBy: "JB"/);
  });
});

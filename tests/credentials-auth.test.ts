import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { authorizeCredentialsUser, type CredentialsUserRecord } from "@/lib/auth-credentials";
import { canCredentialsUserSignIn, normalizeCredentialEmail } from "@/lib/auth-policy";

const root = process.cwd();

function source(file: string) {
  return readFileSync(join(root, file), "utf8");
}

async function makeUser(overrides: Partial<CredentialsUserRecord> = {}): Promise<CredentialsUserRecord> {
  return {
    id: overrides.id ?? "user-1",
    name: overrides.name ?? "Test User",
    email: overrides.email ?? "seller@example.com",
    password: Object.prototype.hasOwnProperty.call(overrides, "password")
      ? (overrides.password ?? null)
      : await bcrypt.hash("correct-password", 4),
    role: overrides.role ?? "SELLER",
    status: overrides.status ?? true,
    emailVerified: overrides.emailVerified ?? true,
  };
}

describe("Credentials authentication", () => {
  it("valid email/password succeeds", async () => {
    const user = await makeUser({ role: "USER", emailVerified: false });
    const result = await authorizeCredentialsUser({ email: "seller@example.com", password: "correct-password" }, async () => user);

    assert.equal(result?.id, user.id);
    assert.equal(result?.email, user.email);
    assert.equal(result?.role, "USER");
    assert.equal(result?.status, true);
    assert.equal(result?.emailVerified, false);
  });

  it("email case normalization works", async () => {
    const user = await makeUser();
    const result = await authorizeCredentialsUser({ email: " Seller@Example.COM ", password: "correct-password" }, async (email) =>
      email === "seller@example.com" ? user : null
    );

    assert.equal(normalizeCredentialEmail(" Seller@Example.COM "), "seller@example.com");
    assert.equal(result?.id, user.id);
  });

  it("wrong password fails", async () => {
    const user = await makeUser();
    const result = await authorizeCredentialsUser({ email: "seller@example.com", password: "wrong-password" }, async () => user);

    assert.equal(result, null);
  });

  it("unknown email fails", async () => {
    const result = await authorizeCredentialsUser({ email: "missing@example.com", password: "correct-password" }, async () => null);

    assert.equal(result, null);
  });

  it("missing password hash fails safely", async () => {
    const user = await makeUser({ password: null });
    const result = await authorizeCredentialsUser({ email: "seller@example.com", password: "correct-password" }, async () => user);

    assert.equal(result, null);
  });

  it("inactive user fails", async () => {
    const user = await makeUser({ status: false });
    const result = await authorizeCredentialsUser({ email: "seller@example.com", password: "correct-password" }, async () => user);

    assert.equal(canCredentialsUserSignIn(user), false);
    assert.equal(result, null);
  });

  it("unverified seller fails", async () => {
    const user = await makeUser({ role: "SELLER", emailVerified: false });
    const result = await authorizeCredentialsUser({ email: "seller@example.com", password: "correct-password" }, async () => user);

    assert.equal(result, null);
  });

  it("session contains required fields and excludes sensitive fields", () => {
    const authSource = source("auth.ts");

    for (const field of ["session.user.id", "session.user.email", "session.user.role", "session.user.status", "session.user.emailVerified"]) {
      assert.match(authSource, new RegExp(field.replaceAll(".", "\\.")));
    }
    assert.doesNotMatch(authSource, /session\\.user\\.password/);
    assert.doesNotMatch(authSource, /session\\.user\\.(verificationToken|resetToken)/);
  });

  it("login client sends credentials provider email/password and generic error", () => {
    const loginSource = source("components/frontend/LoginForm.tsx");

    assert.equal(loginSource.includes('signIn("credentials"'), true);
    assert.equal(loginSource.includes("email: data.email.trim().toLowerCase()"), true);
    assert.equal(loginSource.includes("password: data.password"), true);
    assert.equal(loginSource.includes("Invalid email or password."), true);
    assert.equal(loginSource.includes("/api/auth/session"), false);
  });

  it("registration stores normalized email and checks duplicates case-insensitively", () => {
    const routeSource = source("app/api/users/route.tsx");

    assert.equal(routeSource.includes("parsed.data.email.trim().toLowerCase()"), true);
    assert.match(routeSource, /mode: "insensitive"/);
    assert.match(routeSource, /password: hashedPassword/);
    assert.match(routeSource, /status: role === "USER"/);
    assert.match(routeSource, /emailVerified: role === "USER"/);
  });

  it("email verification activates the account", () => {
    const verifySource = source("app/api/users/verify/route.tsx");

    assert.match(verifySource, /emailVerified: true/);
    assert.match(verifySource, /status: true/);
    assert.match(verifySource, /verificationToken: null/);
  });
});

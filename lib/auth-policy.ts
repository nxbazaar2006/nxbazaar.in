import type { UserRole } from "@prisma/client";

type AuthUserPolicyInput = {
  status?: boolean | null;
  role?: UserRole | string | null;
  emailVerified?: boolean | null;
};

const verificationRequiredRoles = new Set<UserRole | string>([
  "ADMIN",
  "MODERATOR",
  "SELLER",
  "FARMER",
]);

export function normalizeCredentialEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function canCredentialsUserSignIn(user: AuthUserPolicyInput | null | undefined) {
  if (!user) return false;
  if (user.status !== true) return false;
  if (user.role && verificationRequiredRoles.has(user.role)) {
    return user.emailVerified === true;
  }
  return true;
}

export function getCredentialsRejectionReason(user: AuthUserPolicyInput | null | undefined) {
  if (!user) return "invalid_credentials";
  if (user.status !== true) return "inactive_account";
  if (user.role && verificationRequiredRoles.has(user.role) && user.emailVerified !== true) {
    return "email_verification_required";
  }
  return null;
}

export function logCredentialsDiagnostic(event: string, metadata: Record<string, boolean | string | null | undefined> = {}) {
  if (process.env.NODE_ENV !== "development" || process.env.AUTH_DIAGNOSTICS !== "true") return;
  console.info("[auth:credentials]", event, metadata);
}

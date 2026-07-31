import { compare } from "bcrypt";
import type { UserRole } from "@prisma/client";

import {
  canCredentialsUserSignIn,
  getCredentialsRejectionReason,
  logCredentialsDiagnostic,
  normalizeCredentialEmail,
} from "@/lib/auth-policy";

export type CredentialsUserRecord = {
  id: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  role: UserRole;
  status: boolean;
  emailVerified: boolean;
};

export type AuthorizedCredentialsUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  status: boolean;
  image: null;
  emailVerified: boolean;
};

export async function authorizeCredentialsUser(
  credentials: Partial<Record<"email" | "password", unknown>> | null | undefined,
  findUserByEmail: (email: string) => Promise<CredentialsUserRecord | null>
): Promise<AuthorizedCredentialsUser | null> {
  const email = normalizeCredentialEmail(credentials?.email);
  const password = typeof credentials?.password === "string" ? credentials.password : "";
  if (!email || !password) {
    logCredentialsDiagnostic("missing_input", {
      hasEmail: Boolean(email),
      hasPassword: Boolean(password),
    });
    return null;
  }

  const existingUser = await findUserByEmail(email);
  logCredentialsDiagnostic("user_lookup", { found: Boolean(existingUser) });
  if (!existingUser?.password) {
    logCredentialsDiagnostic("password_hash", { present: false });
    return null;
  }
  logCredentialsDiagnostic("password_hash", { present: true });

  const passwordMatch = await compare(password, existingUser.password);
  logCredentialsDiagnostic("password_compare", { match: passwordMatch });
  if (!passwordMatch) return null;

  const allowed = canCredentialsUserSignIn(existingUser);
  logCredentialsDiagnostic("account_policy", {
    allowed,
    reason: getCredentialsRejectionReason(existingUser),
    role: existingUser.role,
    status: existingUser.status,
    emailVerified: existingUser.emailVerified,
  });
  if (!allowed) return null;

  return {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
    status: existingUser.status,
    image: null,
    emailVerified: existingUser.emailVerified,
  };
}

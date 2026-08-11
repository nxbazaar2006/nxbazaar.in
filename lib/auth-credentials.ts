import bcrypt from "bcrypt";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { canCredentialsUserSignIn } from "@/lib/auth-policy";

// ─── Zod schema for credentials input validation ─────────────────────────────
export const credentialsSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

// ─── Prisma record shape expected from the DB query ──────────────────────────
export type CredentialsUserRecord = {
  id: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  image?: string | null;
  role: UserRole;
  /** DB stores status as boolean (true = active) */
  status: boolean;
  /** DB stores emailVerified as boolean */
  emailVerified: boolean;
};

// ─── Shape returned to Auth.js authorize() ───────────────────────────────────
export type AuthorizedCredentialsUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  status: boolean;
  emailVerified: boolean;
};

/**
 * Validates credentials, looks up the user, and returns the authorized user
 * object or null on any failure. Failures are logged safely in development
 * (actual passwords are never logged).
 */
export async function authorizeCredentialsUser(
  credentials: Partial<Record<"email" | "password", unknown>> | null | undefined,
  findUser: (email: string) => Promise<CredentialsUserRecord | null>
): Promise<AuthorizedCredentialsUser | null> {
  // 1. Zod parse — rejects missing / malformed fields early
  const parsed = credentialsSchema.safeParse(credentials);
  if (!parsed.success) {
    console.error("[AUTH] Invalid credential input:", parsed.error.flatten().fieldErrors);
    return null;
  }

  // 2. Normalize email
  const email = parsed.data.email.trim().toLowerCase();

  // 3. Prisma lookup (case-insensitive is handled at the call-site in auth.ts)
  const user = await findUser(email);
  if (!user) {
    console.error("[AUTH] User not found:", email);
    return null;
  }

  // 4. Password must exist (OAuth users have no password)
  if (!user.password) {
    console.error("[AUTH] Password missing for user:", email);
    return null;
  }

  // 5. Account must be active & meet role verification policy
  if (!canCredentialsUserSignIn(user)) {
    console.error("[AUTH] Sign-in policy rejected user:", email, "role:", user.role, "status:", user.status, "emailVerified:", user.emailVerified);
    return null;
  }

  // 6. bcrypt comparison — never log the actual password
  const passwordMatches = await bcrypt.compare(parsed.data.password, user.password);
  if (!passwordMatches) {
    console.error("[AUTH] Password mismatch for user:", email);
    return null;
  }

  // 7. Return only the fields needed by Auth.js
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: user.role,
    status: user.status,
    // Return the original DB value — do NOT convert to Date here
    emailVerified: user.emailVerified,
  };
}

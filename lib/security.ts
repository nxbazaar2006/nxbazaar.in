import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";

type SessionUser = Session["user"] & {
  id?: string;
  role?: UserRole;
};

export type AppSession = Session & {
  user?: SessionUser;
};

export const publicRegistrationRoles = ["USER", "FARMER"] as const;

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ message }, { status: 403 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}

export function badRequest(message = "Invalid request") {
  return NextResponse.json({ message }, { status: 400 });
}

export function hasRole(
  session: AppSession | null | undefined,
  roles: readonly UserRole[]
) {
  return Boolean(session?.user?.role && roles.includes(session.user.role));
}

export function isAdmin(session: AppSession | null | undefined) {
  return hasRole(session, ["ADMIN"]);
}

export function canAccessUserResource(
  session: AppSession | null | undefined,
  userId: string
) {
  return isAdmin(session) || session?.user?.id === userId;
}

export function assertAdmin(session: AppSession | null | undefined) {
  if (!session?.user?.id) return unauthorized();
  if (!isAdmin(session)) return forbidden();
  return null;
}

export function assertAuthenticated(session: AppSession | null | undefined) {
  if (!session?.user?.id) return unauthorized();
  return null;
}

export function isPublicRegistrationRole(
  role: string
): role is (typeof publicRegistrationRoles)[number] {
  return publicRegistrationRoles.includes(
    role as (typeof publicRegistrationRoles)[number]
  );
}

export function sanitizeUser<T extends { password?: unknown; verificationToken?: unknown }>(
  user: T
) {
  const { password: _password, verificationToken: _verificationToken, ...safeUser } = user;
  return safeUser;
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
  now = Date.now()
) {
  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true as const, remaining: options.limit - 1 };
  }

  if (current.count >= options.limit) {
    return { ok: false as const, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  return { ok: true as const, remaining: options.limit - current.count };
}

export function clearRateLimitStore() {
  rateLimitStore.clear();
}

export function rateLimited(retryAfterMs: number) {
  return NextResponse.json(
    { message: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    }
  );
}

export function getRequestClientKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `${scope}:${forwardedFor || realIp || "unknown"}`;
}

const userDashboardPrefixes = ["/dashboard/orders", "/dashboard/profile"];
const sellerDashboardPrefixes = [
  "/dashboard/products",
  "/dashboard/coupons",
  "/dashboard/sales",
  "/dashboard/vendor/orders",
  "/dashboard/wallet",
  "/dashboard/profile",
];

function matchesAnyPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function canAccessDashboardPath(
  role: UserRole | string | undefined,
  pathname: string
) {
  if (!role) return false;
  if (pathname === "/dashboard") return true;
  if (role === "ADMIN" || role === "MODERATOR") return true;
  if (role === "USER") return matchesAnyPrefix(pathname, userDashboardPrefixes);
  if (role === "SELLER" || role === "FARMER") {
    return matchesAnyPrefix(pathname, sellerDashboardPrefixes);
  }
  return false;
}

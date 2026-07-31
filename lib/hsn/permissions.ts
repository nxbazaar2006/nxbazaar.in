import { auth } from "@/auth";

export type HsnPermission = "MANAGE" | "SEARCH" | "ASSIGN" | "PRODUCT_OVERRIDE";

export async function getCurrentUserForHsn() {
  const session = await auth();
  return session?.user ?? null;
}

export function canUseHsnPermission(
  role: string | undefined,
  permission: HsnPermission
) {
  if (role === "ADMIN") return true;
  if (role === "SELLER") {
    return permission === "SEARCH" || permission === "PRODUCT_OVERRIDE";
  }
  return false;
}

export async function requireHsnPermission(permission: HsnPermission) {
  const user = await getCurrentUserForHsn();
  if (!user) {
    return { ok: false as const, message: "Unauthorized." };
  }
  if (!canUseHsnPermission(user.role, permission)) {
    return { ok: false as const, message: "You do not have permission for this HSN action." };
  }
  return { ok: true as const, user };
}

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

import { authorizeCredentialsUser } from "@/lib/auth-credentials";
import db from "@/lib/db";
import { canCredentialsUserSignIn, normalizeCredentialEmail } from "@/lib/auth-policy";
import { canAccessDashboardPath } from "@/lib/security";

function isProtectedPath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/seller" ||
    pathname.startsWith("/seller/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/")
  );
}

function canAccessPath(role: string | undefined, pathname: string) {
  if (!role) return false;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return role === "ADMIN";
  if (pathname === "/seller" || pathname.startsWith("/seller/")) return role === "ADMIN" || role === "SELLER";
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return canAccessDashboardPath(role, pathname);
  if (pathname === "/account" || pathname.startsWith("/account/")) return true;
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return true;
  return true;
}

export const authConfig = {
  adapter: PrismaAdapter(db),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        // Field names must exactly match what the login form sends
        email: { label: "Email", type: "email", placeholder: "jb@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authorizeCredentialsUser(credentials, (email) =>
          db.user.findFirst({
            where: {
              email: {
                // Case-insensitive Prisma lookup
                equals: email,
                mode: "insensitive",
              },
            },
          })
        );

        if (!user) return null;

        // Return original DB values — do NOT convert emailVerified to Date here
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      if (!isProtectedPath(pathname)) return true;
      if (!auth?.user?.id) return false;
      return canAccessPath(auth.user.role, pathname);
    },

    /**
     * Provider-aware signIn callback.
     * - Google: allow sign-in (the adapter handles account linking).
     * - Credentials: validate that the account is active/verified.
     */
    async signIn({ user, account }) {
      // Google OAuth — let Auth.js adapter handle it
      if (account?.provider === "google") {
        return true;
      }

      // Credentials — enforce account policy
      if (!user.email) return false;
      const normalizedEmail = normalizeCredentialEmail(user.email);
      if (!normalizedEmail) return false;

      const existingUser = await db.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      });

      // If the user was not found (shouldn't happen after authorize), allow through
      if (!existingUser) return true;

      return canCredentialsUserSignIn(existingUser);
    },

    async session({ session, token }) {
      if (token) {
        if (token.id) session.user.id = String(token.id);
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.role) session.user.role = token.role as import("@prisma/client").UserRole;
        if (token.status !== undefined) session.user.status = Boolean(token.status);
        if (token.picture) session.user.image = token.picture;
        // Reconstruct Date from the boolean stored in JWT, or null
        session.user.emailVerified = token.emailVerified ? new Date(0) : null;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
        token.picture = user.image;
        // Store as boolean in JWT; the original DB value is already boolean
        token.emailVerified = Boolean(user.emailVerified);
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  if (!isProtectedPath(pathname)) return NextResponse.next();
  if (request.auth?.user?.id && canAccessPath(request.auth.user.role, pathname)) return NextResponse.next();

  const loginUrl = new URL("/login", request.nextUrl);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
  return NextResponse.redirect(loginUrl);
});

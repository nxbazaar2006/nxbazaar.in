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
        email: { label: "Email", type: "email", placeholder: "jb@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authorizeCredentialsUser(credentials, (email) =>
          db.user.findFirst({
            where: {
              email: {
                equals: email,
                mode: "insensitive",
              },
            },
          })
        );
        if (!user) return null;
        return {
          ...user,
          emailVerified: user.emailVerified ? new Date() : null,
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
    async signIn({ user }) {
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
      if (!existingUser) return true;
      return canCredentialsUserSignIn(existingUser);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.image = token.picture;
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

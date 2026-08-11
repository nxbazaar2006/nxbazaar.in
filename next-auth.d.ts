import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      /** DB: boolean; session exposes as Date | null for NextAuth compatibility */
      status?: boolean;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: UserRole;
    /** DB field: boolean (true = active) */
    status?: boolean;
    /**
     * DB field: boolean.
     * authorize() returns the raw boolean; jwt() converts to boolean;
     * session() exposes as Date | null for NextAuth/PrismaAdapter compatibility.
     */
    emailVerified?: boolean | Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    status?: boolean;
    /** Stored as boolean in JWT to avoid serialization issues */
    emailVerified?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    status?: boolean;
    /** Stored as boolean in JWT to avoid serialization issues */
    emailVerified?: boolean;
  }
}


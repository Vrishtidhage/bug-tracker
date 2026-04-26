import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      accountType: "admin" | "user";
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    accountType?: "admin" | "user";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    accountType?: "admin" | "user";
  }
}

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { loginSchema } from "@/lib/auth-schemas";
import { findUserByEmail } from "@/lib/local-db";

const adminSessionId = "__admin__";

function adminCredentialsConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

function getAdminCredentials() {
  if (adminCredentialsConfigured()) {
    return {
      email: process.env.ADMIN_EMAIL?.toLowerCase(),
      password: process.env.ADMIN_PASSWORD,
    };
  }

  if (process.env.NODE_ENV === "production") {
    return { email: undefined, password: undefined };
  }

  return {
    email: "admin@gmail.com",
    password: "admin@123",
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = findUserByEmail(parsed.data.email);

        if (!user?.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          role: user.workspaceRole,
          accountType: "user",
        };
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Admin email", type: "email" },
        password: { label: "Admin password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const admin = getAdminCredentials();

        if (!admin.email || !admin.password) {
          return null;
        }

        if (parsed.data.email !== admin.email || parsed.data.password !== admin.password) {
          return null;
        }

        return {
          id: adminSessionId,
          name: "System Admin",
          email: admin.email,
          role: "ADMIN",
          accountType: "admin",
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType ?? "user";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accountType = (token.accountType as "admin" | "user") ?? "user";
      }

      return session;
    },
  },
});

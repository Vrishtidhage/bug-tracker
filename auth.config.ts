import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const publicRoutes = new Set(["/", "/login", "/register", "/admin/login"]);

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isPublicRoute = publicRoutes.has(nextUrl.pathname);
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isStaticAsset =
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.startsWith("/favicon.ico");

      if (isAuthRoute || isStaticAsset || isPublicRoute) {
        return true;
      }

      if (isAdminRoute) {
        if (auth?.user?.accountType === "admin") {
          return true;
        }

        const redirectUrl = auth?.user ? new URL("/dashboard", nextUrl) : new URL("/admin/login", nextUrl);
        return NextResponse.redirect(redirectUrl);
      }

      return isLoggedIn;
    },
  },
  providers: [],
  trustHost: [
    "https://bug-tracker-1-4p8r.onrender.com",
    "https://localhost:10000",
  ],
} satisfies NextAuthConfig;

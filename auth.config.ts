import type { NextAuthConfig } from "next-auth";

const PUBLIC_PREFIXES = ["/login", "/invite/", "/api/auth"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname, origin } = request.nextUrl;
      const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
      if (isPublic) return true;

      const isLoggedIn = !!auth?.user;
      if (!isLoggedIn) return false;

      const hasName = !!auth.user.displayName;
      if (!hasName && pathname !== "/onboarding/name") {
        return Response.redirect(new URL("/onboarding/name", origin));
      }
      if (hasName && pathname === "/onboarding/name") {
        return Response.redirect(new URL("/dashboard", origin));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.displayName = (user as { displayName?: string | null }).displayName ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.displayName = token.displayName ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

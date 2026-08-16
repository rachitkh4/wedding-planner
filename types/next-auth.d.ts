import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      displayName: string | null;
      role: keyof typeof Role;
    } & DefaultSession["user"];
  }

  interface User {
    displayName?: string | null;
    role?: keyof typeof Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    displayName: string | null;
    role: keyof typeof Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    displayName: string | null;
    role: keyof typeof Role;
  }
}

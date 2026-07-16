import type { DefaultSession } from "next-auth";

// Must match Role enum values in prisma/schema.prisma
type Role = "ADMIN" | "MANAGER" | "REP" | "VIEWER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string;
      organization?: {
        id: string;
        name: string;
        slug: string;
      };
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    organizationId?: string;
    organization?: {
      id: string;
      name: string;
      slug: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    organizationId?: string;
    organization?: {
      id: string;
      name: string;
      slug: string;
    };
  }
}

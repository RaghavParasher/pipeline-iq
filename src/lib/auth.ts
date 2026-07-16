import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { loginSchema } from "./validators";
import { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            return null;
          }

          const { email, password } = parsed.data;

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              organization: true,
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
            organizationId: user.organizationId,
            organization: {
              id: user.organization.id,
              name: user.organization.name,
              slug: user.organization.slug,
            },
          };
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: Role }).role;
        token.organizationId = (user as unknown as { organizationId: string }).organizationId;
        token.organization = (user as unknown as { organization: { id: string; name: string; slug: string } }).organization;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as string;
        session.user.organization = token.organization as { id: string; name: string; slug: string };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || "fallback-secret-for-local-dev-change-in-prod-12345",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

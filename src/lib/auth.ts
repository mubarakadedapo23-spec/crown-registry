import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // 24 hours
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),

    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            status: true,
            emailVerified: true,
            passwordHash: true,
            twoFactorEnabled: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (user.status === "BANNED" || user.status === "SUSPENDED") return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }

      // Handle session update
      if (trigger === "update" && session) {
        Object.assign(token, session);
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as any;
        session.user.emailVerified = token.emailVerified as Date;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Block banned users
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { status: true },
        });
        if (dbUser?.status === "BANNED") return false;
      }

      // Auto-create profile for OAuth users
      if (account?.type === "oauth" && user.id) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { status: "ACTIVE" },
          })
          .catch(() => null);
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async createUser({ user }) {
      // Set up default subscription on registration
      if (user.id) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: "FREE",
            status: "active",
            maxListings: 5,
          },
        });
      }
    },

    async signIn({ user, account, isNewUser }) {
      if (user.id) {
        await prisma.securityLog.create({
          data: {
            userId: user.id,
            event: "login",
            success: true,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { isOnline: true, lastSeenAt: new Date() },
        });
      }
    },

    async signOut({ session, token }) {
      const userId = (token as any)?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeenAt: new Date() },
        });
      }
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/onboarding",
  },
});

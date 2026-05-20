import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * Better Auth configuration with explicit session expiry.
 *
 * Session expiry rules:
 * - Owner (Google OAuth): 30 days
 * - Staff (PIN login): 7 days (POS devices are shared)
 *
 * Sessions are NOT persistent forever — stolen cookies expire automatically.
 * The Session.expiresAt field is set by Better Auth based on these values.
 */
export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // We use custom staff PIN login, not email+password
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    // Owner sessions expire after 30 days
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24, // Refresh session every 24h of activity
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // Cache for 7 days to reduce DB reads
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
});

/**
 * Create a staff session with shorter expiry (7 days).
 * Use this instead of auth.api.createSession for staff PIN login.
 */
export async function createStaffSession(userId: string) {
  const session = await (auth.api as any).createSession({
    body: {
      userId,
      expiresIn: 60 * 60 * 24 * 7, // 7 days for staff
    },
  });
  return session;
}

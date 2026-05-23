import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { makeSignature } from "better-auth/crypto";
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
      mapProfileToUser: (profile) => {
        const email = profile.email?.trim().toLowerCase();
        const fallbackName = email ? email.split("@")[0] : "Owner";
        return {
          email,
          name: profile.name?.trim() || fallbackName,
        };
      },
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : user.email;
          const fallbackName = email ? email.split("@")[0] : "Owner";
          return {
            data: {
              ...user,
              email,
              name: typeof user.name === "string" && user.name.trim().length > 0 ? user.name.trim() : fallbackName,
              phone: null,
            },
          };
        },
      },
    },
  },
});

/**
 * Create a staff session with shorter expiry (7 days).
 * Better Auth signs the session token cookie as `${token}.${signature}`.
 */
export async function createStaffSession(userId: string) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);
  const session = await db.session.create({
    data: {
      userId,
      token: crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, ""),
      expiresAt,
    },
  });

  const context = await auth.$context;
  const sessionTokenCookie = context.authCookies.sessionToken;
  const sessionDataCookie = context.authCookies.sessionData;
  const signedToken = `${session.token}.${await makeSignature(session.token, context.secret)}`;

  return {
    session,
    cookies: {
      sessionToken: {
        name: sessionTokenCookie.name,
        value: signedToken,
        attributes: {
          ...sessionTokenCookie.attributes,
          maxAge: 60 * 60 * 24 * 7,
        },
      },
      sessionData: {
        name: sessionDataCookie.name,
        value: "",
        attributes: {
          ...sessionDataCookie.attributes,
          maxAge: 0,
        },
      },
    },
  };
}

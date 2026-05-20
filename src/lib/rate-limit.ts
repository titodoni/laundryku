import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Persistent rate limiting via Upstash Redis.
 * Required for Vercel serverless — in-memory rate limiters do NOT work
 * across cold starts / multiple edge nodes.
 *
 * Install: npm install @upstash/redis @upstash/ratelimit
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

const redis = Redis.fromEnv();

/** Public tracking API: 30 requests per IP per minute */
export const trackingRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
});

/** Staff PIN login: 5 attempts per IP per 15 minutes */
export const pinRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
});

/**
 * DB-based PIN attempt tracker (fallback / additional layer).
 * Used alongside Upstash for persistent lockout state.
 */
export async function checkPinAttempt(phone: string, branchId: string) {
  const { db } = await import("@/lib/db");
  const attempt = await db.pinAttempt.findUnique({
    where: { phone_branchId: { phone, branchId } },
  });

  if (attempt?.lockedAt) {
    const lockoutEnd = new Date(attempt.lockedAt.getTime() + 15 * 60 * 1000);
    if (new Date() < lockoutEnd) {
      return {
        allowed: false,
        reason: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
      };
    }

    await db.pinAttempt.delete({ where: { id: attempt.id } });
  }

  return { allowed: true, attempt };
}

export async function incrementPinAttempt(phone: string, branchId: string) {
  const { db } = await import("@/lib/db");
  const attempt = await db.pinAttempt.upsert({
    where: { phone_branchId: { phone, branchId } },
    create: { phone, branchId, attempts: 1 },
    update: { attempts: { increment: 1 } },
  });

  if (attempt.attempts >= 5) {
    await db.pinAttempt.update({
      where: { id: attempt.id },
      data: { lockedAt: new Date() },
    });
    return {
      allowed: false,
      reason: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
    };
  }

  return { allowed: true };
}

export async function clearPinAttempts(phone: string, branchId: string) {
  const { db } = await import("@/lib/db");
  await db.pinAttempt.deleteMany({
    where: { phone, branchId },
  });
}

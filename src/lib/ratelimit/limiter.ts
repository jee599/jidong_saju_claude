// src/lib/ratelimit/limiter.ts — In-memory rate limiter with KV fallback

import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix ms
}

// In-memory store (per-process, resets on deploy)
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanupStale() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
  /** Prefix for the rate limit key (e.g., "report", "compat") */
  prefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSec: number | null;
}

/**
 * Extract client IP from request headers (works on Vercel + local dev)
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check rate limit for a request. Uses in-memory store.
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  cleanupStale();

  const ip = getClientIP(request);
  const key = `${config.prefix}:${ip}`;
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowSec * 1000 };
    store.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > config.limit) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      limit: config.limit,
      retryAfterSec,
    };
  }

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    limit: config.limit,
    retryAfterSec: null,
  };
}

/**
 * Return a 429 response with friendly Korean message.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      code: "RATE_LIMITED",
      retryAfter: result.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec ?? 60),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  /** Free tier report generation: 5 per hour per IP */
  freeReport: { limit: 5, windowSec: 3600, prefix: "free-report" } as RateLimitConfig,
  /** Premium report: 20 per hour per IP */
  premiumReport: { limit: 20, windowSec: 3600, prefix: "premium-report" } as RateLimitConfig,
  /** Compatibility endpoint: 5 per hour per IP */
  compatibility: { limit: 5, windowSec: 3600, prefix: "compat" } as RateLimitConfig,
  /** Yearly endpoint: 5 per hour per IP */
  yearly: { limit: 5, windowSec: 3600, prefix: "yearly" } as RateLimitConfig,
  /** Calculate (cheap, allow more): 30 per hour per IP */
  calculate: { limit: 30, windowSec: 3600, prefix: "calc" } as RateLimitConfig,
};

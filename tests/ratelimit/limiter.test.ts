// tests/ratelimit/limiter.test.ts — Rate limiter tests

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { checkRateLimit, type RateLimitConfig } from "@/lib/ratelimit/limiter";

function makeRequest(ip: string = "127.0.0.1"): NextRequest {
  return new NextRequest("http://localhost:3000/api/test", {
    headers: { "x-forwarded-for": ip },
  });
}

const testConfig: RateLimitConfig = {
  limit: 3,
  windowSec: 60,
  prefix: "test",
};

describe("checkRateLimit", () => {
  // Each test uses a unique IP to avoid cross-test interference
  let ip: string;

  beforeEach(() => {
    ip = `test-${Date.now()}-${Math.random()}`;
  });

  it("allows requests under the limit", () => {
    const req = makeRequest(ip);
    const r1 = checkRateLimit(req, testConfig);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
  });

  it("blocks after exceeding limit", () => {
    const req = makeRequest(ip);
    checkRateLimit(req, testConfig); // 1
    checkRateLimit(req, testConfig); // 2
    checkRateLimit(req, testConfig); // 3

    const r4 = checkRateLimit(req, testConfig); // 4 — over limit
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.retryAfterSec).toBeGreaterThan(0);
  });

  it("different IPs have separate limits", () => {
    const req1 = makeRequest("ip-a");
    const req2 = makeRequest("ip-b");

    for (let i = 0; i < 3; i++) checkRateLimit(req1, testConfig);
    const overLimit = checkRateLimit(req1, testConfig);
    expect(overLimit.allowed).toBe(false);

    const stillOk = checkRateLimit(req2, testConfig);
    expect(stillOk.allowed).toBe(true);
  });

  it("different prefixes have separate limits", () => {
    const req = makeRequest(ip);
    const configA: RateLimitConfig = { limit: 1, windowSec: 60, prefix: `a-${ip}` };
    const configB: RateLimitConfig = { limit: 1, windowSec: 60, prefix: `b-${ip}` };

    checkRateLimit(req, configA);
    const over = checkRateLimit(req, configA);
    expect(over.allowed).toBe(false);

    const stillOk = checkRateLimit(req, configB);
    expect(stillOk.allowed).toBe(true);
  });
});

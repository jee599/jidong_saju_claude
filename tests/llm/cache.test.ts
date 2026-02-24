// tests/llm/cache.test.ts — 캐시 키 tier 테스트

import { describe, it, expect } from "vitest";
import { makeCacheKey } from "@/lib/llm/cache";

describe("makeCacheKey", () => {
  it("includes tier in key format hash:tier:section", () => {
    const key = makeCacheKey("abc123", "personality", "free");
    expect(key).toBe("abc123:free:personality");
  });

  it("different tiers produce different keys for same hash+section", () => {
    const freeKey = makeCacheKey("abc123", "career", "free");
    const premiumKey = makeCacheKey("abc123", "career", "premium");
    expect(freeKey).not.toBe(premiumKey);
    expect(freeKey).toBe("abc123:free:career");
    expect(premiumKey).toBe("abc123:premium:career");
  });

  it("defaults to premium when tier omitted", () => {
    const key = makeCacheKey("abc123", "love");
    expect(key).toBe("abc123:premium:love");
  });

  it("works with all section keys", () => {
    const sections = [
      "personality", "career", "love", "wealth", "health",
      "family", "past", "present", "future", "timeline",
    ] as const;

    for (const section of sections) {
      const key = makeCacheKey("hash", section, "free");
      expect(key).toBe(`hash:free:${section}`);
    }
  });
});

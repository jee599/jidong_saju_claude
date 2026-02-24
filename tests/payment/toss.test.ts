import { describe, it, expect } from "vitest";
import { PRICING } from "@/lib/payment/toss";

describe("PRICING", () => {
  it("full report costs 5900 KRW", () => {
    expect(PRICING.FULL_REPORT).toBe(5900);
  });

  it("compatibility costs 7900 KRW", () => {
    expect(PRICING.COMPATIBILITY).toBe(7900);
  });

  it("yearly costs 4900 KRW", () => {
    expect(PRICING.YEARLY).toBe(4900);
  });

  it("all-in-one costs 14900 KRW", () => {
    expect(PRICING.ALL_IN_ONE).toBe(14900);
  });

  it("all-in-one is cheaper than sum of individual products", () => {
    const sum = PRICING.FULL_REPORT + PRICING.COMPATIBILITY + PRICING.YEARLY;
    expect(PRICING.ALL_IN_ONE).toBeLessThan(sum);
  });
});

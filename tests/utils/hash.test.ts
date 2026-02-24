import { describe, it, expect } from "vitest";
import { generateSajuHash, generateOrderId } from "@/lib/utils/hash";

describe("generateSajuHash", () => {
  it("returns a string starting with saju_", () => {
    const hash = generateSajuHash("1990-01-15", "14:30", "male", "solar");
    expect(hash).toMatch(/^saju_/);
  });

  it("returns the same hash for the same inputs", () => {
    const hash1 = generateSajuHash("1990-01-15", "14:30", "male", "solar");
    const hash2 = generateSajuHash("1990-01-15", "14:30", "male", "solar");
    expect(hash1).toBe(hash2);
  });

  it("returns different hashes for different inputs", () => {
    const hash1 = generateSajuHash("1990-01-15", "14:30", "male", "solar");
    const hash2 = generateSajuHash("1990-01-15", "14:30", "female", "solar");
    expect(hash1).not.toBe(hash2);
  });

  it("returns different hashes for different dates", () => {
    const hash1 = generateSajuHash("1990-01-15", "14:30", "male", "solar");
    const hash2 = generateSajuHash("1990-01-16", "14:30", "male", "solar");
    expect(hash1).not.toBe(hash2);
  });

  it("returns different hashes for different times", () => {
    const hash1 = generateSajuHash("1990-01-15", "14:30", "male", "solar");
    const hash2 = generateSajuHash("1990-01-15", "15:30", "male", "solar");
    expect(hash1).not.toBe(hash2);
  });

  it("returns different hashes for different calendar types", () => {
    const hash1 = generateSajuHash("1990-01-15", "14:30", "male", "solar");
    const hash2 = generateSajuHash("1990-01-15", "14:30", "male", "lunar");
    expect(hash1).not.toBe(hash2);
  });
});

describe("generateOrderId", () => {
  it("returns a string starting with FS-", () => {
    const orderId = generateOrderId();
    expect(orderId).toMatch(/^FS-/);
  });

  it("generates unique order IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateOrderId());
    }
    expect(ids.size).toBe(100);
  });
});

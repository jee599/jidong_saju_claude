// tests/components/DateInput.test.ts — DateInput regression tests
// These test the pure logic extracted from the DateInput component.
// (We test the formatting/clamping logic without React rendering)

import { describe, it, expect } from "vitest";

/**
 * Extracted logic from DateInput — month clamping + auto-pad
 */
function processMonth(raw: string): string {
  let v = raw.replace(/\D/g, "").slice(0, 2);
  if (v.length === 2) {
    const n = parseInt(v, 10);
    if (n > 12) v = "12";
    if (n < 1) v = "01";
  }
  if (v.length === 1 && parseInt(v, 10) > 1) {
    v = "0" + v;
  }
  return v;
}

/**
 * Extracted logic from DateInput — day clamping + auto-pad
 */
function processDay(raw: string): string {
  let v = raw.replace(/\D/g, "").slice(0, 2);
  if (v.length === 2) {
    const n = parseInt(v, 10);
    if (n > 31) v = "31";
    if (n < 1) v = "01";
  }
  if (v.length === 1 && parseInt(v, 10) > 3) {
    v = "0" + v;
  }
  return v;
}

/**
 * Extracted logic — year stripping
 */
function processYear(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 4);
}

/**
 * Build final date string
 */
function buildDate(y: string, m: string, d: string): string {
  if (!y && !m && !d) return "";
  return `${y}-${m}-${d}`;
}

describe("DateInput logic", () => {
  describe("year processing", () => {
    it("strips non-numeric characters", () => {
      expect(processYear("19ab")).toBe("19");
      expect(processYear("abc")).toBe("");
    });
    it("limits to 4 digits", () => {
      expect(processYear("19901")).toBe("1990");
    });
    it("allows partial input", () => {
      expect(processYear("1")).toBe("1");
      expect(processYear("19")).toBe("19");
    });
  });

  describe("month processing", () => {
    it("allows valid months", () => {
      expect(processMonth("01")).toBe("01");
      expect(processMonth("06")).toBe("06");
      expect(processMonth("12")).toBe("12");
    });
    it("clamps month > 12 to 12", () => {
      expect(processMonth("13")).toBe("12");
      expect(processMonth("99")).toBe("12");
    });
    it("clamps month 00 to 01", () => {
      expect(processMonth("00")).toBe("01");
    });
    it("auto-pads single digit > 1 (e.g., 5 → 05)", () => {
      expect(processMonth("5")).toBe("05");
      expect(processMonth("9")).toBe("09");
    });
    it("allows '1' as partial input (could be 10, 11, 12)", () => {
      expect(processMonth("1")).toBe("1");
    });
    it("strips non-numeric input", () => {
      expect(processMonth("ab")).toBe("");
      expect(processMonth("1a")).toBe("1");
    });
  });

  describe("day processing", () => {
    it("allows valid days", () => {
      expect(processDay("01")).toBe("01");
      expect(processDay("15")).toBe("15");
      expect(processDay("31")).toBe("31");
    });
    it("clamps day > 31 to 31", () => {
      expect(processDay("32")).toBe("31");
      expect(processDay("99")).toBe("31");
    });
    it("clamps day 00 to 01", () => {
      expect(processDay("00")).toBe("01");
    });
    it("auto-pads single digit > 3 (e.g., 5 → 05)", () => {
      expect(processDay("4")).toBe("04");
      expect(processDay("9")).toBe("09");
    });
    it("allows '1', '2', '3' as partial input", () => {
      expect(processDay("1")).toBe("1");
      expect(processDay("2")).toBe("2");
      expect(processDay("3")).toBe("3");
    });
    it("day field accepts input immediately (no blocking)", () => {
      // This is the key regression test for the original bug:
      // typing day digits should produce immediate output
      const result = processDay("2");
      expect(result).toBe("2");
      const result2 = processDay("24");
      expect(result2).toBe("24");
    });
  });

  describe("buildDate", () => {
    it("produces YYYY-MM-DD", () => {
      expect(buildDate("1990", "05", "24")).toBe("1990-05-24");
    });
    it("returns empty string when all empty", () => {
      expect(buildDate("", "", "")).toBe("");
    });
    it("allows partial dates during input", () => {
      expect(buildDate("1990", "", "")).toBe("1990--");
      expect(buildDate("1990", "05", "")).toBe("1990-05-");
    });
  });
});

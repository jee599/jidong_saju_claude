// tests/components/DateInput.test.ts — DateInput calendar picker logic tests
// Tests the pure helper functions from the DateInput component.

import { describe, it, expect } from "vitest";
import {
  daysInMonth,
  startDayOfMonth,
  pad,
  formatDisplay,
  parseValue,
  buildDateString,
  buildCalendarGrid,
} from "@/components/input/DateInput";

/* ─── Tests ─── */

describe("DateInput calendar helpers", () => {
  describe("daysInMonth", () => {
    it("returns 31 for January", () => {
      expect(daysInMonth(2026, 0)).toBe(31);
    });
    it("returns 28 for February non-leap year", () => {
      expect(daysInMonth(2026, 1)).toBe(28);
    });
    it("returns 29 for February leap year", () => {
      expect(daysInMonth(2024, 1)).toBe(29);
    });
    it("returns 30 for April", () => {
      expect(daysInMonth(2026, 3)).toBe(30);
    });
    it("returns 31 for December", () => {
      expect(daysInMonth(2026, 11)).toBe(31);
    });
  });

  describe("startDayOfMonth", () => {
    it("returns correct start day for known date", () => {
      // Jan 1, 2026 is a Thursday (day 4)
      expect(startDayOfMonth(2026, 0)).toBe(4);
    });
    it("returns 0 for a month starting on Sunday", () => {
      // March 2026 starts on Sunday
      expect(startDayOfMonth(2026, 2)).toBe(0);
    });
  });

  describe("pad", () => {
    it("pads single digit with leading zero", () => {
      expect(pad(1)).toBe("01");
      expect(pad(9)).toBe("09");
    });
    it("does not pad two digit numbers", () => {
      expect(pad(10)).toBe("10");
      expect(pad(31)).toBe("31");
    });
  });

  describe("formatDisplay", () => {
    const koMonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    it("formats YYYY-MM-DD to Korean display", () => {
      expect(formatDisplay("1990-05-24", "ko", koMonths)).toBe("1990년 5월 24일");
      expect(formatDisplay("2000-12-01", "ko", koMonths)).toBe("2000년 12월 1일");
    });
    it("formats YYYY-MM-DD to English display", () => {
      expect(formatDisplay("1990-05-24", "en", enMonths)).toBe("May 24, 1990");
      expect(formatDisplay("2000-12-01", "en", enMonths)).toBe("Dec 1, 2000");
    });
    it("returns empty string for empty value", () => {
      expect(formatDisplay("", "ko", koMonths)).toBe("");
      expect(formatDisplay("", "en", enMonths)).toBe("");
    });
    it("returns raw value for incomplete format", () => {
      expect(formatDisplay("1990-05", "ko", koMonths)).toBe("1990-05");
    });
  });

  describe("parseValue", () => {
    it("parses valid YYYY-MM-DD", () => {
      expect(parseValue("1990-05-24")).toEqual({ year: 1990, month: 4, day: 24 });
    });
    it("parses month as 0-indexed", () => {
      expect(parseValue("2000-01-01")).toEqual({ year: 2000, month: 0, day: 1 });
      expect(parseValue("2000-12-31")).toEqual({ year: 2000, month: 11, day: 31 });
    });
    it("returns null for empty string", () => {
      expect(parseValue("")).toBeNull();
    });
    it("returns null for invalid format", () => {
      expect(parseValue("abc")).toBeNull();
      expect(parseValue("1990-ab-24")).toBeNull();
    });
  });

  describe("buildDateString", () => {
    it("builds YYYY-MM-DD from year, month (0-indexed), day", () => {
      expect(buildDateString(1990, 4, 24)).toBe("1990-05-24");
      expect(buildDateString(2000, 0, 1)).toBe("2000-01-01");
      expect(buildDateString(2026, 11, 31)).toBe("2026-12-31");
    });
    it("pads month and day", () => {
      expect(buildDateString(2000, 0, 5)).toBe("2000-01-05");
    });
  });

  describe("buildCalendarGrid", () => {
    it("starts with correct number of empty cells", () => {
      // Jan 2026 starts on Thursday (day 4) → 4 empty cells
      const grid = buildCalendarGrid(2026, 0);
      expect(grid[0]).toBeNull();
      expect(grid[1]).toBeNull();
      expect(grid[2]).toBeNull();
      expect(grid[3]).toBeNull();
      expect(grid[4]).toBe(1);
    });

    it("has correct total days", () => {
      const grid = buildCalendarGrid(2026, 0);
      const days = grid.filter((d) => d !== null);
      expect(days.length).toBe(31);
      expect(days[0]).toBe(1);
      expect(days[days.length - 1]).toBe(31);
    });

    it("handles month starting on Sunday (no empty cells)", () => {
      // March 2026 starts on Sunday
      const grid = buildCalendarGrid(2026, 2);
      expect(grid[0]).toBe(1);
    });

    it("handles February leap year", () => {
      const grid = buildCalendarGrid(2024, 1);
      const days = grid.filter((d) => d !== null);
      expect(days.length).toBe(29);
      expect(days[days.length - 1]).toBe(29);
    });

    it("handles February non-leap year", () => {
      const grid = buildCalendarGrid(2026, 1);
      const days = grid.filter((d) => d !== null);
      expect(days.length).toBe(28);
    });
  });

  describe("step-by-step date selection", () => {
    it("year → month → day produces valid date string", () => {
      // Simulates: select year 2000, month May (4), day 15
      const result = buildDateString(2000, 4, 15);
      expect(result).toBe("2000-05-15");
      const parsed = parseValue(result);
      expect(parsed).toEqual({ year: 2000, month: 4, day: 15 });
    });

    it("handles boundary: first possible date 1920-01-01", () => {
      const result = buildDateString(1920, 0, 1);
      expect(result).toBe("1920-01-01");
    });

    it("handles leap year day 29", () => {
      const result = buildDateString(2024, 1, 29);
      expect(result).toBe("2024-02-29");
    });

    it("formatDisplay round-trips correctly for both locales", () => {
      const koMonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
      const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const dateStr = buildDateString(1995, 6, 20);
      expect(dateStr).toBe("1995-07-20");
      expect(formatDisplay(dateStr, "ko", koMonths)).toBe("1995년 7월 20일");
      expect(formatDisplay(dateStr, "en", enMonths)).toBe("Jul 20, 1995");
    });
  });
});

import { describe, it, expect } from "vitest";
import { hourToBranchIndex, getTimeBranchLabel } from "@/lib/saju/timeBranch";

describe("hourToBranchIndex", () => {
  it("maps hour 23 to index 0 (자시)", () => {
    expect(hourToBranchIndex(23)).toBe(0);
  });

  it("maps hour 0 to index 0 (자시)", () => {
    expect(hourToBranchIndex(0)).toBe(0);
  });

  it("maps hour 1 to index 1 (축시)", () => {
    expect(hourToBranchIndex(1)).toBe(1);
  });

  it("maps hour 2 to index 1 (축시)", () => {
    expect(hourToBranchIndex(2)).toBe(1);
  });

  it("maps hour 3 to index 2 (인시)", () => {
    expect(hourToBranchIndex(3)).toBe(2);
  });

  it("maps hour 4 to index 2 (인시)", () => {
    expect(hourToBranchIndex(4)).toBe(2);
  });

  it("maps hour 5 to index 3 (묘시)", () => {
    expect(hourToBranchIndex(5)).toBe(3);
  });

  it("maps hour 11 to index 6 (오시)", () => {
    expect(hourToBranchIndex(11)).toBe(6);
  });

  it("maps hour 12 to index 6 (오시)", () => {
    expect(hourToBranchIndex(12)).toBe(6);
  });

  it("maps hour 21 to index 11 (해시)", () => {
    expect(hourToBranchIndex(21)).toBe(11);
  });

  it("maps hour 22 to index 11 (해시)", () => {
    expect(hourToBranchIndex(22)).toBe(11);
  });

  // exhaustive: every even-hour boundary
  const expected: [number, number][] = [
    [0, 0], [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [6, 3],
    [7, 4], [8, 4], [9, 5], [10, 5], [11, 6], [12, 6],
    [13, 7], [14, 7], [15, 8], [16, 8], [17, 9], [18, 9],
    [19, 10], [20, 10], [21, 11], [22, 11], [23, 0],
  ];

  it.each(expected)("hour %i → branch index %i", (hour, idx) => {
    expect(hourToBranchIndex(hour)).toBe(idx);
  });
});

describe("getTimeBranchLabel", () => {
  // Korean locale
  it("returns 자시 for 23:30 in ko", () => {
    expect(getTimeBranchLabel("23:30", "ko")).toBe("자시");
  });

  it("returns 자시 for 00:00 in ko", () => {
    expect(getTimeBranchLabel("00:00", "ko")).toBe("자시");
  });

  it("returns 자시 for 00:59 in ko", () => {
    expect(getTimeBranchLabel("00:59", "ko")).toBe("자시");
  });

  it("returns 축시 for 01:00 in ko", () => {
    expect(getTimeBranchLabel("01:00", "ko")).toBe("축시");
  });

  it("returns 축시 for 02:59 in ko", () => {
    expect(getTimeBranchLabel("02:59", "ko")).toBe("축시");
  });

  it("returns 인시 for 03:00 in ko", () => {
    expect(getTimeBranchLabel("03:00", "ko")).toBe("인시");
  });

  it("returns 진시 for 08:15 in ko", () => {
    expect(getTimeBranchLabel("08:15", "ko")).toBe("진시");
  });

  it("returns 오시 for 12:00 in ko", () => {
    expect(getTimeBranchLabel("12:00", "ko")).toBe("오시");
  });

  it("returns 미시 for 14:30 in ko", () => {
    expect(getTimeBranchLabel("14:30", "ko")).toBe("미시");
  });

  it("returns 해시 for 22:00 in ko", () => {
    expect(getTimeBranchLabel("22:00", "ko")).toBe("해시");
  });

  // English locale
  it("returns Rat hour for 23:00 in en", () => {
    expect(getTimeBranchLabel("23:00", "en")).toBe("Rat hour");
  });

  it("returns Rat hour for 00:30 in en", () => {
    expect(getTimeBranchLabel("00:30", "en")).toBe("Rat hour");
  });

  it("returns Ox hour for 01:00 in en", () => {
    expect(getTimeBranchLabel("01:00", "en")).toBe("Ox hour");
  });

  it("returns Dragon hour for 07:45 in en", () => {
    expect(getTimeBranchLabel("07:45", "en")).toBe("Dragon hour");
  });

  it("returns Horse hour for 11:00 in en", () => {
    expect(getTimeBranchLabel("11:00", "en")).toBe("Horse hour");
  });

  it("returns Pig hour for 21:00 in en", () => {
    expect(getTimeBranchLabel("21:00", "en")).toBe("Pig hour");
  });

  // Edge cases
  it("returns null for empty string", () => {
    expect(getTimeBranchLabel("", "ko")).toBeNull();
  });

  it("returns null for invalid format", () => {
    expect(getTimeBranchLabel("abc", "ko")).toBeNull();
  });

  it("returns null for out-of-range hour", () => {
    expect(getTimeBranchLabel("25:00", "ko")).toBeNull();
  });

  it("returns null for negative hour", () => {
    expect(getTimeBranchLabel("-1:00", "ko")).toBeNull();
  });
});

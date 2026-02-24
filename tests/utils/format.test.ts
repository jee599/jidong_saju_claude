import { describe, it, expect } from "vitest";
import { formatKRW, getAnimalName } from "@/lib/utils/format";

describe("formatKRW", () => {
  it("formats 5900 as Korean Won", () => {
    const formatted = formatKRW(5900);
    expect(formatted).toContain("5,900");
  });

  it("formats 0 correctly", () => {
    const formatted = formatKRW(0);
    expect(formatted).toContain("0");
  });

  it("formats 14900", () => {
    const formatted = formatKRW(14900);
    expect(formatted).toContain("14,900");
  });
});

describe("getAnimalName", () => {
  it("returns the correct animal for each jiji", () => {
    const animals: Record<string, string> = {
      "子": "쥐", "丑": "소", "寅": "호랑이", "卯": "토끼",
      "辰": "용", "巳": "뱀", "午": "말", "未": "양",
      "申": "원숭이", "酉": "닭", "戌": "개", "亥": "돼지",
    };
    for (const [hanja, name] of Object.entries(animals)) {
      expect(getAnimalName(hanja)).toBe(name);
    }
  });

  it("returns empty string for unknown hanja", () => {
    expect(getAnimalName("X")).toBe("");
  });
});

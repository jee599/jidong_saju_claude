// tests/saju/interpretations.test.ts — Algorithmic interpretation tests

import { describe, it, expect } from "vitest";
import { generateAlgorithmicSections } from "@/lib/saju/interpretations";
import { calculateSaju } from "@/lib/saju/engine";
import { FREE_SECTION_KEYS } from "@/lib/saju/types";

describe("generateAlgorithmicSections", () => {
  const input = {
    birthDate: "1990-01-15",
    birthTime: "09:30",
    gender: "male" as const,
    calendarType: "solar" as const,
  };

  const sajuResult = calculateSaju(input);
  const sections = generateAlgorithmicSections(sajuResult);

  it("generates all 4 free sections with non-empty text", () => {
    for (const key of FREE_SECTION_KEYS) {
      expect(sections[key]).toBeDefined();
      expect(sections[key].title.length).toBeGreaterThan(0);
      expect(sections[key].text.length).toBeGreaterThan(50);
    }
  });

  it("personality section references day master element", () => {
    const text = sections.personality.text;
    // The text contains the day master's hanja (e.g., "경(庚)") and element
    expect(text).toContain(sajuResult.dayMaster.gan);
  });

  it("career section references geokguk", () => {
    const text = sections.career.text;
    expect(text).toContain(sajuResult.geokguk.name);
  });

  it("love section has keywords", () => {
    expect(sections.love.keywords.length).toBeGreaterThan(0);
  });

  it("present section references current year", () => {
    const text = sections.present.text;
    expect(text).toContain("2026");
  });

  it("works for different birth dates", () => {
    const inputs = [
      { birthDate: "1985-06-15", birthTime: "14:00", gender: "female" as const, calendarType: "solar" as const },
      { birthDate: "2000-12-25", birthTime: "23:30", gender: "male" as const, calendarType: "solar" as const },
      { birthDate: "1970-03-01", birthTime: "06:00", gender: "female" as const, calendarType: "solar" as const },
    ];

    for (const inp of inputs) {
      const result = calculateSaju(inp);
      const secs = generateAlgorithmicSections(result);
      for (const key of FREE_SECTION_KEYS) {
        expect(secs[key].text.length).toBeGreaterThan(20);
      }
    }
  });
});

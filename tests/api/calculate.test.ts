import { describe, it, expect } from "vitest";
import { calculateSaju } from "@/lib/saju/engine";
import { generateSajuHash } from "@/lib/utils/hash";

describe("API: /api/saju/calculate (unit test of underlying logic)", () => {
  it("calculates saju and generates a hash", () => {
    const input = {
      name: "테스트",
      birthDate: "1990-05-15",
      birthTime: "14:30",
      gender: "male" as const,
      calendarType: "solar" as const,
    };

    const result = calculateSaju(input);
    const hash = generateSajuHash(
      input.birthDate,
      input.birthTime,
      input.gender,
      input.calendarType
    );

    expect(result).toBeDefined();
    expect(result.pillars).toBeDefined();
    expect(result.pillars.year.gan).toBeDefined();
    expect(result.pillars.month.gan).toBeDefined();
    expect(result.pillars.day.gan).toBeDefined();
    expect(result.pillars.hour.gan).toBeDefined();
    expect(result.dayMaster).toBeDefined();
    expect(result.oheng).toBeDefined();
    expect(result.sipseong).toBeDefined();
    expect(result.daeun).toBeDefined();
    expect(result.seun).toBeDefined();
    expect(result.yongsin).toBeDefined();
    expect(hash).toMatch(/^saju_/);
  });

  it("validates input correctly", () => {
    const input = {
      birthDate: "2000-03-20",
      birthTime: "08:00",
      gender: "female" as const,
      calendarType: "solar" as const,
    };

    const result = calculateSaju(input);
    expect(result.input.gender).toBe("female");
    expect(result.input.calendarType).toBe("solar");
    expect(result.input.birthDate).toBe("2000-03-20");
  });

  it("handles lunar calendar input", () => {
    const input = {
      birthDate: "1990-01-15",
      birthTime: "06:00",
      gender: "male" as const,
      calendarType: "lunar" as const,
    };

    const result = calculateSaju(input);
    expect(result).toBeDefined();
    expect(result.lunar).toBeDefined();
  });

  it("returns consistent results for same input", () => {
    const input = {
      birthDate: "1995-07-22",
      birthTime: "11:30",
      gender: "female" as const,
      calendarType: "solar" as const,
    };

    const result1 = calculateSaju(input);
    const result2 = calculateSaju(input);

    expect(result1.pillars.year.gan).toBe(result2.pillars.year.gan);
    expect(result1.pillars.day.gan).toBe(result2.pillars.day.gan);
    expect(result1.dayMaster.isStrong).toBe(result2.dayMaster.isStrong);
  });

  it("generates free summary data correctly", () => {
    const input = {
      birthDate: "1988-12-25",
      birthTime: "23:00",
      gender: "male" as const,
      calendarType: "solar" as const,
    };

    const result = calculateSaju(input);

    // Check that free summary inputs exist
    expect(result.dayMaster.nature).toBeTruthy();
    expect(result.dayMaster.yinYang).toMatch(/^(양|음)$/);
    expect(result.oheng.strongest).toBeTruthy();
    expect(result.oheng.weakest).toBeTruthy();
    expect(result.sipseong.dominant).toBeTruthy();
    expect(result.seun.keywords.length).toBeGreaterThan(0);
  });
});

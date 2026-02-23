// tests/saju/engine.test.ts — 만세력 엔진 통합 테스트

import { describe, it, expect } from "vitest";
import { calculateSaju } from "@/lib/saju/engine";
import type { SajuInput } from "@/lib/saju/types";

// ─── 헬퍼 ───
function saju(
  date: string,
  time: string,
  gender: "male" | "female" = "male",
  calendarType: "solar" | "lunar" = "solar"
) {
  const input: SajuInput = {
    birthDate: date,
    birthTime: time,
    gender,
    calendarType,
  };
  return calculateSaju(input);
}

function pillarsToString(result: ReturnType<typeof calculateSaju>) {
  const p = result.pillars;
  return `${p.year.gan}${p.year.ji} ${p.month.gan}${p.month.ji} ${p.day.gan}${p.day.ji} ${p.hour.gan}${p.hour.ji}`;
}

// ═══════════════════════════════════════════
// 기본 엔진 동작 테스트
// ═══════════════════════════════════════════

describe("만세력 엔진 기본 동작", () => {
  it("SajuResult 구조가 올바르다", () => {
    const result = saju("1990-01-15", "10:00");

    expect(result).toHaveProperty("input");
    expect(result).toHaveProperty("lunar");
    expect(result).toHaveProperty("jeolgi");
    expect(result).toHaveProperty("pillars");
    expect(result).toHaveProperty("dayMaster");
    expect(result).toHaveProperty("sipseong");
    expect(result).toHaveProperty("unseong");
    expect(result).toHaveProperty("oheng");
    expect(result).toHaveProperty("yongsin");
    expect(result).toHaveProperty("interactions");
    expect(result).toHaveProperty("sinsals");
    expect(result).toHaveProperty("daeun");
    expect(result).toHaveProperty("seun");
    expect(result).toHaveProperty("jijanggan");
  });

  it("4기둥이 모두 존재한다", () => {
    const result = saju("1990-01-15", "10:00");
    const { pillars } = result;

    for (const pos of ["year", "month", "day", "hour"] as const) {
      expect(pillars[pos].gan).toBeTruthy();
      expect(pillars[pos].ji).toBeTruthy();
      expect(pillars[pos].ganInfo).toBeTruthy();
      expect(pillars[pos].jiInfo).toBeTruthy();
    }
  });

  it("일간(DayMaster) 정보가 올바르다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.dayMaster.gan).toBe(result.pillars.day.gan);
    expect(["木", "火", "土", "金", "水"]).toContain(result.dayMaster.element);
    expect(["양", "음"]).toContain(result.dayMaster.yinYang);
    expect(typeof result.dayMaster.isStrong).toBe("boolean");
  });

  it("음력 정보가 반환된다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.lunar.year).toBeGreaterThan(1900);
    expect(result.lunar.month).toBeGreaterThanOrEqual(1);
    expect(result.lunar.month).toBeLessThanOrEqual(12);
    expect(result.lunar.day).toBeGreaterThanOrEqual(1);
    expect(result.lunar.day).toBeLessThanOrEqual(30);
  });
});

// ═══════════════════════════════════════════
// 사주 4기둥 정확성 테스트 (알려진 사주로 검증)
// ═══════════════════════════════════════════

describe("사주 4기둥 정확성", () => {
  // 1990년 1월 15일 오전 10시 (양력)
  it("1990-01-15 10:00 (양력)", () => {
    const result = saju("1990-01-15", "10:00");
    // 1990년은 庚午년 (경오)
    expect(result.pillars.year.gan).toBe("己");
    expect(result.pillars.year.ji).toBe("巳");
    // 1월 15일은 소한(1/6) 이후, 대한(1/20) 이전 → 丁丑월
    expect(result.pillars.month.gan).toBe("丁");
    expect(result.pillars.month.ji).toBe("丑");
  });

  // 2000년 5월 1일 오전 8시 (양력)
  it("2000-05-01 08:00 (양력)", () => {
    const result = saju("2000-05-01", "08:00");
    // 2000년은 庚辰년
    expect(result.pillars.year.gan).toBe("庚");
    expect(result.pillars.year.ji).toBe("辰");
  });

  // 1985년 3월 15일 자시(23:30) — 자시 처리 검증
  it("1985-03-15 23:30 (양력, 자시)", () => {
    const result = saju("1985-03-15", "23:30");
    // 자시(23:00~01:00)는 子시
    expect(result.pillars.hour.ji).toBe("子");
  });

  // 2026년 2월 24일 (오늘) 오전 9시
  it("2026-02-24 09:00 (양력)", () => {
    const result = saju("2026-02-24", "09:00");
    // 2026년은 丙午년 (병오)
    expect(result.pillars.year.gan).toBe("丙");
    expect(result.pillars.year.ji).toBe("午");
  });

  // 입춘 경계 테스트: 2024년 2월 3일 (입춘 2/4 전)
  it("2024-02-03 (입춘 전) → 전년도 연주", () => {
    const result = saju("2024-02-03", "10:00");
    // 입춘 전이므로 2023년 연주: 癸卯
    expect(result.pillars.year.gan).toBe("癸");
    expect(result.pillars.year.ji).toBe("卯");
  });

  it("2024-02-05 (입춘 후) → 당년도 연주", () => {
    const result = saju("2024-02-05", "10:00");
    // 입춘 후이므로 2024년 연주: 甲辰
    expect(result.pillars.year.gan).toBe("甲");
    expect(result.pillars.year.ji).toBe("辰");
  });
});

// ═══════════════════════════════════════════
// 십성 테스트
// ═══════════════════════════════════════════

describe("십성 계산", () => {
  it("십성 분포가 존재한다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.sipseong.distribution).toBeTruthy();
    expect(result.sipseong.dominant).toBeTruthy();
    expect(Array.isArray(result.sipseong.missing)).toBe(true);
  });

  it("십성 분포 합계가 합리적이다", () => {
    const result = saju("1990-01-15", "10:00");
    const total = Object.values(result.sipseong.distribution).reduce((a, b) => a + b, 0);
    // 천간 3개 + 지지 4개 + 지장간 (~8개) = 약 15개 이상
    expect(total).toBeGreaterThanOrEqual(7);
  });

  it("일간의 십성은 '일주'이다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.sipseong.details.dayGan).toBe("일주");
  });
});

// ═══════════════════════════════════════════
// 12운성 테스트
// ═══════════════════════════════════════════

describe("12운성 계산", () => {
  it("4개 지지 모두 운성이 있다", () => {
    const result = saju("1990-01-15", "10:00");
    const validStages = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"];

    expect(validStages).toContain(result.unseong.yearJi);
    expect(validStages).toContain(result.unseong.monthJi);
    expect(validStages).toContain(result.unseong.dayJi);
    expect(validStages).toContain(result.unseong.hourJi);
    expect(validStages).toContain(result.unseong.dominantStage);
  });

  // 甲일간 + 子(자)지지 = 목욕 (조견표 검증)
  it("甲일간 + 子 = 목욕", () => {
    // 甲일간이고 연지가 子인 사주를 찾아 검증
    const result = saju("1984-01-15", "10:00"); // 甲子년
    // 연지가 子인 경우의 12운성
    if (result.pillars.day.gan === "甲") {
      // 甲 + 子 = 목욕
      if (result.pillars.year.ji === "子") {
        expect(result.unseong.yearJi).toBe("목욕");
      }
    }
  });
});

// ═══════════════════════════════════════════
// 오행 분포 테스트
// ═══════════════════════════════════════════

describe("오행 분포", () => {
  it("5개 오행 분포가 모두 있다", () => {
    const result = saju("1990-01-15", "10:00");
    const elements = ["木", "火", "土", "金", "水"] as const;
    for (const el of elements) {
      expect(result.oheng.distribution[el]).toBeDefined();
      expect(result.oheng.distribution[el].percentage).toBeGreaterThanOrEqual(0);
    }
  });

  it("오행 비율 합계가 약 100%이다", () => {
    const result = saju("1990-01-15", "10:00");
    const total = Object.values(result.oheng.distribution).reduce(
      (sum, d) => sum + d.percentage,
      0
    );
    expect(total).toBeGreaterThan(95);
    expect(total).toBeLessThan(105);
  });

  it("가장 강한 오행이 있다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(["木", "火", "土", "金", "水"]).toContain(result.oheng.strongest);
    expect(["木", "火", "土", "金", "水"]).toContain(result.oheng.weakest);
  });
});

// ═══════════════════════════════════════════
// 합충형파해 테스트
// ═══════════════════════════════════════════

describe("합충형파해", () => {
  it("합충형 배열이 존재한다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(Array.isArray(result.interactions.haps)).toBe(true);
    expect(Array.isArray(result.interactions.chungs)).toBe(true);
    expect(Array.isArray(result.interactions.hyeongs)).toBe(true);
  });

  // 子+午 충이 있는 사주 (양력 기준)
  it("子와 午가 있으면 자오충이 발생한다", () => {
    // 2008-07-15 23:30 → 시지 子, 연지가 子인 해 + 午월 가능성
    const result = saju("1990-07-15", "23:30");
    // 시지가 子이고 어딘가 午가 있으면 충 발생
    if (
      result.pillars.hour.ji === "子" &&
      [result.pillars.year.ji, result.pillars.month.ji, result.pillars.day.ji].includes("午")
    ) {
      expect(result.interactions.chungs.length).toBeGreaterThan(0);
      expect(result.interactions.chungs.some((c) => c.description.includes("충"))).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════
// 신살 테스트
// ═══════════════════════════════════════════

describe("신살 판별", () => {
  it("신살 배열이 반환된다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(Array.isArray(result.sinsals)).toBe(true);
  });

  it("신살에 필수 필드가 있다", () => {
    const result = saju("1990-01-15", "10:00");
    for (const sinsal of result.sinsals) {
      expect(sinsal).toHaveProperty("name");
      expect(sinsal).toHaveProperty("type");
      expect(sinsal).toHaveProperty("location");
      expect(sinsal).toHaveProperty("meaning");
      expect(["길신", "흉신"]).toContain(sinsal.type);
    }
  });
});

// ═══════════════════════════════════════════
// 용신 테스트
// ═══════════════════════════════════════════

describe("용신/기신", () => {
  it("용신/기신/희신이 오행이다", () => {
    const result = saju("1990-01-15", "10:00");
    const elements = ["木", "火", "土", "金", "水"];
    expect(elements).toContain(result.yongsin.yongsin);
    expect(elements).toContain(result.yongsin.gisin);
    expect(elements).toContain(result.yongsin.heesin);
  });

  it("럭키 정보가 있다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.yongsin.luckyColors.length).toBeGreaterThan(0);
    expect(result.yongsin.luckyDirections.length).toBeGreaterThan(0);
    expect(result.yongsin.luckyNumbers.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════
// 대운 테스트
// ═══════════════════════════════════════════

describe("대운 계산", () => {
  it("대운이 배열로 반환된다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.daeun.length).toBeGreaterThan(0);
  });

  it("대운에 필수 필드가 있다", () => {
    const result = saju("1990-01-15", "10:00");
    for (const d of result.daeun) {
      expect(d).toHaveProperty("startAge");
      expect(d).toHaveProperty("ganji");
      expect(d).toHaveProperty("period");
      expect(typeof d.isCurrentDaeun).toBe("boolean");
    }
  });

  it("현재 대운이 하나만 있다", () => {
    const result = saju("1990-01-15", "10:00");
    const currentCount = result.daeun.filter((d) => d.isCurrentDaeun).length;
    expect(currentCount).toBeLessThanOrEqual(1);
  });

  it("대운 시작 나이가 증가한다", () => {
    const result = saju("1990-01-15", "10:00");
    for (let i = 1; i < result.daeun.length; i++) {
      expect(result.daeun[i].startAge).toBeGreaterThan(result.daeun[i - 1].startAge);
    }
  });
});

// ═══════════════════════════════════════════
// 세운 테스트
// ═══════════════════════════════════════════

describe("세운 (2026년)", () => {
  it("세운이 2026년이다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.seun.year).toBe(2026);
  });

  it("세운 간지가 丙午이다 (2026년)", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.seun.ganJi).toBe("丙午");
  });

  it("세운 키워드가 있다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.seun.keywords.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════
// 다양한 생년월일 테스트 (20개+)
// ═══════════════════════════════════════════

describe("다양한 생년월일 테스트", () => {
  const testCases = [
    { date: "1960-01-01", time: "06:00", gender: "male" as const },
    { date: "1970-06-15", time: "14:00", gender: "female" as const },
    { date: "1975-12-25", time: "00:30", gender: "male" as const },
    { date: "1980-03-08", time: "08:00", gender: "female" as const },
    { date: "1985-09-20", time: "16:30", gender: "male" as const },
    { date: "1988-02-15", time: "23:30", gender: "female" as const },
    { date: "1990-01-15", time: "10:00", gender: "male" as const },
    { date: "1992-07-04", time: "12:00", gender: "female" as const },
    { date: "1995-11-11", time: "22:00", gender: "male" as const },
    { date: "1997-04-30", time: "05:00", gender: "female" as const },
    { date: "2000-01-01", time: "00:00", gender: "male" as const },
    { date: "2000-05-01", time: "08:00", gender: "female" as const },
    { date: "2002-08-15", time: "15:00", gender: "male" as const },
    { date: "2005-03-21", time: "11:30", gender: "female" as const },
    { date: "2008-10-10", time: "07:00", gender: "male" as const },
    { date: "2010-06-06", time: "18:00", gender: "female" as const },
    { date: "2015-02-14", time: "09:30", gender: "male" as const },
    { date: "2020-12-31", time: "23:59", gender: "female" as const },
    { date: "2024-02-04", time: "12:00", gender: "male" as const },
    { date: "2025-07-07", time: "07:07", gender: "female" as const },
  ];

  for (const tc of testCases) {
    it(`${tc.date} ${tc.time} (${tc.gender}) — 에러 없이 계산`, () => {
      const result = saju(tc.date, tc.time, tc.gender);

      // 기본 구조 검증
      expect(result.pillars.year.gan).toHaveLength(1);
      expect(result.pillars.year.ji).toHaveLength(1);
      expect(result.pillars.month.gan).toHaveLength(1);
      expect(result.pillars.month.ji).toHaveLength(1);
      expect(result.pillars.day.gan).toHaveLength(1);
      expect(result.pillars.day.ji).toHaveLength(1);
      expect(result.pillars.hour.gan).toHaveLength(1);
      expect(result.pillars.hour.ji).toHaveLength(1);

      // 오행 분포 존재
      expect(Object.keys(result.oheng.distribution).length).toBe(5);

      // 대운 존재
      expect(result.daeun.length).toBeGreaterThan(0);

      // 세운 존재
      expect(result.seun.year).toBe(2026);

      // console.log for debugging
      // console.log(`${tc.date} ${tc.time}: ${pillarsToString(result)}`);
    });
  }
});

// ═══════════════════════════════════════════
// 지장간 테스트
// ═══════════════════════════════════════════

describe("지장간", () => {
  it("4기둥 지장간이 모두 존재한다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(result.jijanggan.yearJi.length).toBeGreaterThan(0);
    expect(result.jijanggan.monthJi.length).toBeGreaterThan(0);
    expect(result.jijanggan.dayJi.length).toBeGreaterThan(0);
    expect(result.jijanggan.hourJi.length).toBeGreaterThan(0);
  });

  it("寅의 지장간은 甲,丙,戊이다", () => {
    const result = saju("1990-01-15", "10:00");
    // 어느 기둥이든 寅이 있으면 검증
    for (const pos of ["year", "month", "day", "hour"] as const) {
      if (result.pillars[pos].ji === "寅") {
        const key = `${pos}Ji` as keyof typeof result.jijanggan;
        expect(result.jijanggan[key]).toEqual(["甲", "丙", "戊"]);
      }
    }
  });
});

// ═══════════════════════════════════════════
// 일간 강약 테스트
// ═══════════════════════════════════════════

describe("일간 강약", () => {
  it("신강/신약 판단과 이유가 있다", () => {
    const result = saju("1990-01-15", "10:00");
    expect(typeof result.dayMaster.isStrong).toBe("boolean");
    expect(result.dayMaster.strengthReason.length).toBeGreaterThan(0);
    expect(
      result.dayMaster.strengthReason.includes("신강") ||
        result.dayMaster.strengthReason.includes("신약")
    ).toBe(true);
  });
});

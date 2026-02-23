// tests/saju/sipseong.test.ts — 십성 판별 단위 테스트

import { describe, it, expect } from "vitest";
import { getSipseong } from "@/lib/saju/sipseong";

describe("십성 판별 로직", () => {
  // 甲(목양) 일간 기준
  describe("甲 일간 기준", () => {
    it("甲 → 甲 = 비견 (같은 오행, 같은 음양)", () => {
      expect(getSipseong("甲", "甲")).toBe("비견");
    });

    it("甲 → 乙 = 겁재 (같은 오행, 다른 음양)", () => {
      expect(getSipseong("甲", "乙")).toBe("겁재");
    });

    it("甲 → 丙 = 식신 (내가 생하는 火, 같은 양)", () => {
      expect(getSipseong("甲", "丙")).toBe("식신");
    });

    it("甲 → 丁 = 상관 (내가 생하는 火, 다른 음양)", () => {
      expect(getSipseong("甲", "丁")).toBe("상관");
    });

    it("甲 → 戊 = 편재 (내가 극하는 土, 같은 양)", () => {
      expect(getSipseong("甲", "戊")).toBe("편재");
    });

    it("甲 → 己 = 정재 (내가 극하는 土, 다른 음양)", () => {
      expect(getSipseong("甲", "己")).toBe("정재");
    });

    it("甲 → 庚 = 편관 (나를 극하는 金, 같은 양)", () => {
      expect(getSipseong("甲", "庚")).toBe("편관");
    });

    it("甲 → 辛 = 정관 (나를 극하는 金, 다른 음양)", () => {
      expect(getSipseong("甲", "辛")).toBe("정관");
    });

    it("甲 → 壬 = 편인 (나를 생하는 水, 같은 양)", () => {
      expect(getSipseong("甲", "壬")).toBe("편인");
    });

    it("甲 → 癸 = 정인 (나를 생하는 水, 다른 음양)", () => {
      expect(getSipseong("甲", "癸")).toBe("정인");
    });
  });

  // 丁(화음) 일간 기준
  describe("丁 일간 기준", () => {
    it("丁 → 丁 = 비견", () => {
      expect(getSipseong("丁", "丁")).toBe("비견");
    });

    it("丁 → 丙 = 겁재 (같은 火, 다른 음양)", () => {
      expect(getSipseong("丁", "丙")).toBe("겁재");
    });

    it("丁 → 己 = 식신 (火가 생하는 土, 같은 음)", () => {
      expect(getSipseong("丁", "己")).toBe("식신");
    });

    it("丁 → 戊 = 상관 (火가 생하는 土, 다른 음양)", () => {
      expect(getSipseong("丁", "戊")).toBe("상관");
    });

    it("丁 → 辛 = 편재 (火가 극하는 金, 같은 음)", () => {
      expect(getSipseong("丁", "辛")).toBe("편재");
    });

    it("丁 → 庚 = 정재 (火가 극하는 金, 다른 음양)", () => {
      expect(getSipseong("丁", "庚")).toBe("정재");
    });

    it("丁 → 癸 = 편관 (나를 극하는 水, 같은 음)", () => {
      expect(getSipseong("丁", "癸")).toBe("편관");
    });

    it("丁 → 壬 = 정관 (나를 극하는 水, 다른 음양)", () => {
      expect(getSipseong("丁", "壬")).toBe("정관");
    });

    it("丁 → 乙 = 편인 (나를 생하는 木, 같은 음)", () => {
      expect(getSipseong("丁", "乙")).toBe("편인");
    });

    it("丁 → 甲 = 정인 (나를 생하는 木, 다른 음양)", () => {
      expect(getSipseong("丁", "甲")).toBe("정인");
    });
  });

  // 庚(금양) 일간 기준
  describe("庚 일간 기준", () => {
    it("庚 → 庚 = 비견", () => {
      expect(getSipseong("庚", "庚")).toBe("비견");
    });

    it("庚 → 壬 = 식신 (金이 생하는 水, 같은 양)", () => {
      expect(getSipseong("庚", "壬")).toBe("식신");
    });

    it("庚 → 甲 = 편재 (金이 극하는 木, 같은 양)", () => {
      expect(getSipseong("庚", "甲")).toBe("편재");
    });

    it("庚 → 丙 = 편관 (나를 극하는 火, 같은 양)", () => {
      expect(getSipseong("庚", "丙")).toBe("편관");
    });

    it("庚 → 戊 = 편인 (나를 생하는 土, 같은 양)", () => {
      expect(getSipseong("庚", "戊")).toBe("편인");
    });
  });
});

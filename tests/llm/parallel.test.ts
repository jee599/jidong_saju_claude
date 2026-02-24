// tests/llm/parallel.test.ts — 병렬 호출 tier 선택 + 사용량 테스트

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SajuResult } from "@/lib/saju/types";
import { FREE_SECTION_KEYS, ALL_SECTION_KEYS } from "@/lib/saju/types";

// Mock callClaudeWithRetry
vi.mock("@/lib/llm/client", () => ({
  callClaudeWithRetry: vi.fn(),
}));

import { callClaudeWithRetry } from "@/lib/llm/client";
import { generateReport, generatePlaceholderReport } from "@/lib/llm/parallel";

const mockedCallClaude = vi.mocked(callClaudeWithRetry);

// Minimal mock SajuResult
const mockSajuResult = {
  input: { birthDate: "1990-01-15", birthTime: "09:30", gender: "male", calendarType: "solar" },
  lunar: { year: 1989, month: 12, day: 19, isLeapMonth: false },
  jeolgi: { name: "소한", date: "1990-01-06", isBeforeJeolgi: false },
  pillars: {
    year: { gan: "己", ji: "巳", ganInfo: {} as never, jiInfo: {} as never },
    month: { gan: "丁", ji: "丑", ganInfo: {} as never, jiInfo: {} as never },
    day: { gan: "甲", ji: "辰", ganInfo: {} as never, jiInfo: {} as never },
    hour: { gan: "己", ji: "巳", ganInfo: {} as never, jiInfo: {} as never },
  },
  dayMaster: { gan: "甲", element: "木" as const, yinYang: "양" as const, nature: "큰 나무", isStrong: true, strengthReason: "test" },
  sipseong: { distribution: {}, dominant: "비견", missing: [], details: {} },
  unseong: { yearJi: "장생", monthJi: "관대", dayJi: "건록", hourJi: "장생", dominantStage: "장생" },
  oheng: {
    distribution: {
      "木": { count: 2, percentage: 25 },
      "火": { count: 2, percentage: 25 },
      "土": { count: 2, percentage: 25 },
      "金": { count: 1, percentage: 12.5 },
      "水": { count: 1, percentage: 12.5 },
    },
    strongest: "木" as const,
    weakest: "水" as const,
    missing: [],
    balance: "균형",
  },
  yongsin: { yongsin: "金" as const, gisin: "木" as const, heesin: "土" as const, luckyColors: ["흰색"], luckyDirections: ["서"], luckyNumbers: [4] },
  interactions: { haps: [], chungs: [], hyeongs: [] },
  sinsals: [],
  daeun: [],
  seun: { year: 2026, ganJi: "丙午", element: "火" as const, sipseong: "식신", keywords: ["변화"] },
  jijanggan: { yearJi: ["丙"], monthJi: ["己"], dayJi: ["乙"], hourJi: ["丙"] },
} as SajuResult;

describe("generateReport", () => {
  beforeEach(() => {
    mockedCallClaude.mockReset();
    // Return a valid JSON response with usage data
    mockedCallClaude.mockResolvedValue({
      text: JSON.stringify({
        title: "테스트 섹션",
        text: "테스트 본문",
        keywords: ["테스트"],
        highlights: ["핵심"],
      }),
      model: "claude-sonnet-4-5-20250514",
      usage: { inputTokens: 1000, outputTokens: 500 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("free tier generates FREE_SECTION_KEYS.length sections", async () => {
    const result = await generateReport(mockSajuResult, { tier: "free" });

    expect(mockedCallClaude).toHaveBeenCalledTimes(FREE_SECTION_KEYS.length);
    expect(Object.keys(result.sections)).toHaveLength(FREE_SECTION_KEYS.length);
    expect(result.tier).toBe("free");

    for (const key of FREE_SECTION_KEYS) {
      expect(result.sections[key]).toBeDefined();
    }
  });

  it("premium tier generates ALL_SECTION_KEYS.length sections", async () => {
    const result = await generateReport(mockSajuResult, { tier: "premium" });

    expect(mockedCallClaude).toHaveBeenCalledTimes(ALL_SECTION_KEYS.length);
    expect(Object.keys(result.sections)).toHaveLength(ALL_SECTION_KEYS.length);
    expect(result.tier).toBe("premium");

    for (const key of ALL_SECTION_KEYS) {
      expect(result.sections[key]).toBeDefined();
    }
  });

  it("free tier uses maxTokens 800", async () => {
    await generateReport(mockSajuResult, { tier: "free" });

    for (const call of mockedCallClaude.mock.calls) {
      expect(call[0].maxTokens).toBe(800);
    }
  });

  it("premium tier uses maxTokens 2000", async () => {
    await generateReport(mockSajuResult, { tier: "premium" });

    for (const call of mockedCallClaude.mock.calls) {
      expect(call[0].maxTokens).toBe(2000);
    }
  });

  it("aggregates usage totals correctly", async () => {
    const result = await generateReport(mockSajuResult, { tier: "free" });

    expect(result.usage).toBeDefined();
    // 4 calls x 1000 input = 4000 total
    expect(result.usage!.totalInputTokens).toBe(FREE_SECTION_KEYS.length * 1000);
    // 4 calls x 500 output = 2000 total
    expect(result.usage!.totalOutputTokens).toBe(FREE_SECTION_KEYS.length * 500);
  });

  it("computes cost from default pricing", async () => {
    const result = await generateReport(mockSajuResult, { tier: "free" });

    const expectedInput = FREE_SECTION_KEYS.length * 1000;
    const expectedOutput = FREE_SECTION_KEYS.length * 500;
    const expectedCost =
      (expectedInput / 1_000_000) * 3 + (expectedOutput / 1_000_000) * 15;

    expect(result.usage!.estimatedCostUsd).toBeCloseTo(expectedCost, 6);
  });

  it("calls onSectionComplete callback for each section", async () => {
    const callback = vi.fn();
    await generateReport(mockSajuResult, { tier: "free", onSectionComplete: callback });

    expect(callback).toHaveBeenCalledTimes(FREE_SECTION_KEYS.length);
  });

  it("handles section failure gracefully", async () => {
    mockedCallClaude
      .mockResolvedValueOnce({
        text: JSON.stringify({ title: "OK", text: "ok", keywords: [], highlights: [] }),
        model: "test",
        usage: { inputTokens: 100, outputTokens: 50 },
      })
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce({
        text: JSON.stringify({ title: "OK", text: "ok", keywords: [], highlights: [] }),
        model: "test",
        usage: { inputTokens: 100, outputTokens: 50 },
      })
      .mockResolvedValueOnce({
        text: JSON.stringify({ title: "OK", text: "ok", keywords: [], highlights: [] }),
        model: "test",
        usage: { inputTokens: 100, outputTokens: 50 },
      });

    const result = await generateReport(mockSajuResult, { tier: "free" });

    // Should still return all 4 sections (1 failed → fallback)
    expect(Object.keys(result.sections)).toHaveLength(FREE_SECTION_KEYS.length);
    // Usage only from successful calls (3 x 100 = 300)
    expect(result.usage!.totalInputTokens).toBe(300);
  });
});

describe("generatePlaceholderReport", () => {
  it("respects tier for section count", () => {
    const free = generatePlaceholderReport(mockSajuResult, "free");
    const premium = generatePlaceholderReport(mockSajuResult, "premium");

    expect(Object.keys(free.sections)).toHaveLength(FREE_SECTION_KEYS.length);
    expect(Object.keys(premium.sections)).toHaveLength(ALL_SECTION_KEYS.length);
  });

  it("sets tier field on result", () => {
    const free = generatePlaceholderReport(mockSajuResult, "free");
    expect(free.tier).toBe("free");

    const premium = generatePlaceholderReport(mockSajuResult, "premium");
    expect(premium.tier).toBe("premium");
  });

  it("defaults to premium when tier omitted", () => {
    const result = generatePlaceholderReport(mockSajuResult);
    expect(result.tier).toBe("premium");
    expect(Object.keys(result.sections)).toHaveLength(ALL_SECTION_KEYS.length);
  });
});

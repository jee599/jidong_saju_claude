// src/lib/llm/parallel.ts — 섹션별 병렬 호출 + 에러 재시도

import type {
  SajuResult,
  ReportSection,
  ReportSectionKey,
  ReportResult,
} from "@/lib/saju/types";
import { callClaudeWithRetry } from "./client";
import { SYSTEM_PROMPT, getSectionPrompt, SECTION_TITLES } from "./prompts";

const SECTIONS: ReportSectionKey[] = [
  "personality",
  "career",
  "love",
  "wealth",
  "health",
  "family",
  "past",
  "present",
  "future",
  "timeline",
];

/**
 * 섹션 하나 생성 (Claude API 호출 + JSON 파싱)
 */
async function generateSection(
  sajuResult: SajuResult,
  section: ReportSectionKey
): Promise<ReportSection> {
  const prompt = getSectionPrompt(section, sajuResult);

  const response = await callClaudeWithRetry({
    system: SYSTEM_PROMPT,
    prompt,
    maxTokens: 2000,
  });

  try {
    // JSON 파싱 시도 — 코드블록 감싸진 경우 처리
    let text = response.text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(text) as ReportSection;
  } catch {
    // JSON 파싱 실패 시 원본 텍스트를 section으로 래핑
    return {
      title: SECTION_TITLES[section],
      text: response.text,
      keywords: [],
      highlights: [],
    };
  }
}

/**
 * 10개 섹션 병렬 호출 → 완료 순서대로 콜백
 */
export async function generateReport(
  sajuResult: SajuResult,
  onSectionComplete?: (section: ReportSectionKey, result: ReportSection) => void
): Promise<ReportResult> {
  const results = new Map<ReportSectionKey, ReportSection>();

  // 10개 동시 호출
  const promises = SECTIONS.map(async (section) => {
    try {
      const result = await generateSection(sajuResult, section);
      results.set(section, result);
      onSectionComplete?.(section, result);
    } catch (err) {
      console.error(`Section ${section} failed:`, err);
      const fallback: ReportSection = {
        title: SECTION_TITLES[section],
        text: "이 섹션의 분석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        keywords: [],
        highlights: [],
      };
      results.set(section, fallback);
      onSectionComplete?.(section, fallback);
    }
  });

  await Promise.all(promises);

  const sections = Object.fromEntries(results) as Record<
    ReportSectionKey,
    ReportSection
  >;

  return {
    sections,
    generatedAt: new Date().toISOString(),
    model: "claude-sonnet-4-5-20250514",
  };
}

/**
 * 플레이스홀더 리포트 (API 키 없을 때)
 */
export function generatePlaceholderReport(
  sajuResult: SajuResult
): ReportResult {
  const sections = Object.fromEntries(
    SECTIONS.map((key) => [
      key,
      {
        title: SECTION_TITLES[key],
        text: `${SECTION_TITLES[key]} 분석 결과입니다. 일간 ${sajuResult.dayMaster.gan}(${sajuResult.dayMaster.element}, ${sajuResult.dayMaster.yinYang})을 기반으로 상세 분석이 제공됩니다. ANTHROPIC_API_KEY를 설정하면 AI 전문 해석이 활성화됩니다.`,
        keywords: [sajuResult.dayMaster.element, sajuResult.sipseong.dominant],
        highlights: [
          `${sajuResult.dayMaster.nature}의 기운을 가진 사주`,
        ],
      },
    ])
  ) as Record<ReportSectionKey, ReportSection>;

  return {
    sections,
    generatedAt: new Date().toISOString(),
    model: "placeholder",
  };
}

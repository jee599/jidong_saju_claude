// src/lib/llm/parallel.ts — 섹션별 병렬 호출 + Prompt Caching + 사용량 추적

import type {
  SajuResult,
  ReportSection,
  ReportSectionKey,
  ReportResult,
  ReportTier,
} from "@/lib/saju/types";
import { FREE_SECTION_KEYS, ALL_SECTION_KEYS } from "@/lib/saju/types";
import { generateAlgorithmicSections } from "@/lib/saju/interpretations";
import { callClaudeWithRetry } from "./client";
import type { TextContentBlock } from "./client";
import { SYSTEM_PROMPT, getSectionInstruction, SECTION_TITLES } from "./prompts";

interface SectionResult {
  section: ReportSection;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number;
    cacheReadInputTokens: number;
  };
}

interface GenerateReportOptions {
  tier: ReportTier;
  onSectionComplete?: (section: ReportSectionKey, result: ReportSection) => void;
}

/**
 * 섹션 하나 생성 (Prompt Caching 적용)
 *
 * - system: SYSTEM_PROMPT + cache_control (모든 섹션 동일 → 캐시 히트)
 * - user[0]: SajuResult JSON + cache_control (모든 섹션 동일 → 캐시 히트)
 * - user[1]: 섹션별 지시문 (섹션마다 다름)
 */
async function generateSection(
  sajuResult: SajuResult,
  sajuJsonText: string,
  section: ReportSectionKey,
  tier: ReportTier = "premium"
): Promise<SectionResult> {
  const sectionInstruction = getSectionInstruction(section, tier);
  const maxTokens = tier === "free" ? 800 : 2000;

  // Prompt Caching: system + SajuResult는 캐시, 섹션 지시만 변경
  const systemBlocks: TextContentBlock[] = [
    { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
  ];

  const userBlocks: TextContentBlock[] = [
    { type: "text", text: `사주 데이터:\n${sajuJsonText}`, cache_control: { type: "ephemeral" } },
    { type: "text", text: sectionInstruction },
  ];

  const response = await callClaudeWithRetry({
    system: systemBlocks,
    prompt: userBlocks,
    maxTokens,
  });

  let parsedSection: ReportSection;
  try {
    // JSON 파싱 시도 — 코드블록 감싸진 경우 처리
    let text = response.text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    parsedSection = JSON.parse(text) as ReportSection;
  } catch {
    // JSON 파싱 실패 시 원본 텍스트를 section으로 래핑
    parsedSection = {
      title: SECTION_TITLES[section],
      text: response.text,
      keywords: [],
      highlights: [],
    };
  }

  return {
    section: parsedSection,
    usage: {
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      cacheCreationInputTokens: response.usage.cacheCreationInputTokens,
      cacheReadInputTokens: response.usage.cacheReadInputTokens,
    },
  };
}

/**
 * Free-lite: algorithmic text for 4 sections + 1 LLM call for 1-line summary
 * Drastically reduces LLM cost (4 LLM calls → 1 small call)
 */
async function generateFreeLiteReport(
  sajuResult: SajuResult,
  onSectionComplete?: (section: ReportSectionKey, result: ReportSection) => void
): Promise<ReportResult> {
  // Step 1: Generate algorithmic sections (no LLM)
  const algoSections = generateAlgorithmicSections(sajuResult);

  const sections: Record<string, ReportSection> = {};
  for (const key of FREE_SECTION_KEYS) {
    sections[key] = algoSections[key];
    onSectionComplete?.(key, algoSections[key]);
  }

  // Step 2: One small LLM call for a personalized 1-line insight/summary
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheWriteTokens = 0;
  let totalCacheReadTokens = 0;
  let model = "algorithmic";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const dm = sajuResult.dayMaster;
      const summaryPrompt = `사주 일간: ${dm.gan}(${dm.element}, ${dm.yinYang}), 격국: ${sajuResult.geokguk.name}, 용신: ${sajuResult.yongsin.yongsin}, 올해 세운: ${sajuResult.seun.ganJi}(${sajuResult.seun.sipseong}).

이 사주의 핵심을 한 문장(50자 이내)으로 요약하세요. 명리학 용어와 쉬운 설명을 병기. JSON 출력: {"summary":"..."}`;

      const response = await callClaudeWithRetry({
        system: "한국 명리학 전문가. 요약만 출력. JSON만.",
        prompt: summaryPrompt,
        maxTokens: 150,
      });

      totalInputTokens = response.usage.inputTokens;
      totalOutputTokens = response.usage.outputTokens;
      totalCacheWriteTokens = response.usage.cacheCreationInputTokens;
      totalCacheReadTokens = response.usage.cacheReadInputTokens;
      model = response.model;

      try {
        let text = response.text.trim();
        if (text.startsWith("```")) {
          text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const parsed = JSON.parse(text);
        if (parsed.summary) {
          // Prepend LLM insight to personality section
          sections.personality = {
            ...sections.personality,
            highlights: [parsed.summary, ...sections.personality.highlights],
          };
        }
      } catch {
        // JSON parse failed — ignore, algorithmic text is sufficient
      }
    } catch (err) {
      console.error("[free-lite] Summary LLM call failed:", err);
      // No problem — algorithmic text is the fallback
    }
  }

  const estimatedCostUsd = computeCost(
    totalInputTokens, totalOutputTokens, totalCacheWriteTokens, totalCacheReadTokens
  );

  console.log(
    `[LLM Usage] tier=free-lite sections=${FREE_SECTION_KEYS.length} input=${totalInputTokens} output=${totalOutputTokens} cache_write=${totalCacheWriteTokens} cache_read=${totalCacheReadTokens} cost=$${estimatedCostUsd.toFixed(4)}`
  );

  return {
    sections,
    generatedAt: new Date().toISOString(),
    model,
    tier: "free",
    usage: {
      totalInputTokens,
      totalOutputTokens,
      totalCacheWriteTokens,
      totalCacheReadTokens,
      estimatedCostUsd,
    },
  };
}

/**
 * 비용 계산 (env-configurable pricing)
 */
function computeCost(
  inputTokens: number,
  outputTokens: number,
  cacheWriteTokens: number,
  cacheReadTokens: number
): number {
  const inputPrice = parseFloat(process.env.LLM_INPUT_PRICE_PER_M ?? "3");
  const outputPrice = parseFloat(process.env.LLM_OUTPUT_PRICE_PER_M ?? "15");
  const cacheWritePrice = parseFloat(process.env.LLM_CACHE_WRITE_PRICE_PER_M ?? "3.75");
  const cacheReadPrice = parseFloat(process.env.LLM_CACHE_READ_PRICE_PER_M ?? "0.30");

  return (
    (inputTokens / 1_000_000) * inputPrice +
    (outputTokens / 1_000_000) * outputPrice +
    (cacheWriteTokens / 1_000_000) * cacheWritePrice +
    (cacheReadTokens / 1_000_000) * cacheReadPrice
  );
}

/**
 * tier에 따라 섹션 리스트 선택 → 병렬 호출 → 사용량 집계
 *
 * - free: algorithmic text + 1 small LLM call (free-lite mode)
 * - premium: full LLM parallel calls (10 sections) with Prompt Caching
 */
export async function generateReport(
  sajuResult: SajuResult,
  options: GenerateReportOptions
): Promise<ReportResult> {
  const { tier, onSectionComplete } = options;

  // Free tier: use algorithmic text + 1 tiny LLM call
  if (tier === "free") {
    return generateFreeLiteReport(sajuResult, onSectionComplete);
  }

  // Premium tier: full LLM parallel calls with Prompt Caching
  const sectionKeys = ALL_SECTION_KEYS;

  // SajuResult JSON은 모든 섹션에 동일 → 한 번만 직렬화하여 캐시 블록으로 사용
  const sajuJsonText = JSON.stringify(sajuResult, null, 2);

  const results = new Map<ReportSectionKey, ReportSection>();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheWriteTokens = 0;
  let totalCacheReadTokens = 0;

  // 병렬 호출
  const promises = sectionKeys.map(async (section) => {
    try {
      const { section: result, usage } = await generateSection(
        sajuResult, sajuJsonText, section, tier
      );
      results.set(section, result);
      totalInputTokens += usage.inputTokens;
      totalOutputTokens += usage.outputTokens;
      totalCacheWriteTokens += usage.cacheCreationInputTokens;
      totalCacheReadTokens += usage.cacheReadInputTokens;
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

  // 비용 계산
  const estimatedCostUsd = computeCost(
    totalInputTokens, totalOutputTokens, totalCacheWriteTokens, totalCacheReadTokens
  );

  console.log(
    `[LLM Usage] tier=${tier} sections=${sectionKeys.length} input=${totalInputTokens} output=${totalOutputTokens} cache_write=${totalCacheWriteTokens} cache_read=${totalCacheReadTokens} cost=$${estimatedCostUsd.toFixed(4)}`
  );

  const sections = Object.fromEntries(results) as Record<string, ReportSection>;

  return {
    sections,
    generatedAt: new Date().toISOString(),
    model: "claude-sonnet-4-5-20250514",
    tier,
    usage: {
      totalInputTokens,
      totalOutputTokens,
      totalCacheWriteTokens,
      totalCacheReadTokens,
      estimatedCostUsd,
    },
  };
}

/**
 * 플레이스홀더 리포트 (API 키 없을 때)
 */
export function generatePlaceholderReport(
  sajuResult: SajuResult,
  tier: ReportTier = "premium"
): ReportResult {
  // For free tier without API key, use algorithmic sections
  if (tier === "free") {
    const algoSections = generateAlgorithmicSections(sajuResult);
    const sections: Record<string, ReportSection> = {};
    for (const key of FREE_SECTION_KEYS) {
      sections[key] = algoSections[key];
    }
    return {
      sections,
      generatedAt: new Date().toISOString(),
      model: "algorithmic",
      tier,
    };
  }

  const sectionKeys = ALL_SECTION_KEYS;

  const sections = Object.fromEntries(
    sectionKeys.map((key) => [
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
  ) as Record<string, ReportSection>;

  return {
    sections,
    generatedAt: new Date().toISOString(),
    model: "placeholder",
    tier,
  };
}

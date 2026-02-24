// POST /api/saju/report — Generate or retrieve a saju report

import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/engine";
import { generateSajuHash } from "@/lib/utils/hash";
import type { SajuInput, SajuResult, ReportSection, ReportSectionKey, ReportResult } from "@/lib/saju/types";

const SECTIONS: ReportSectionKey[] = [
  "personality", "career", "love", "wealth", "health",
  "family", "past", "present", "future", "timeline",
];

const SECTION_TITLES: Record<ReportSectionKey, string> = {
  personality: "성격과 기질",
  career: "직업과 적성",
  love: "연애와 결혼",
  wealth: "금전과 재물",
  health: "건강",
  family: "가족과 대인관계",
  past: "과거 (초년운)",
  present: "현재",
  future: "미래 전망",
  timeline: "대운 타임라인",
};

/**
 * Generate a free summary (no LLM needed).
 */
function generateFreeSummary(sajuResult: SajuResult): {
  personalitySummary: string;
  yearKeyword: string;
} {
  const dm = sajuResult.dayMaster;
  const oheng = sajuResult.oheng;
  const seun = sajuResult.seun;

  const personalitySummary = `${dm.nature}의 기운을 타고난 ${dm.yinYang === "양" ? "적극적이고 외향적인" : "섬세하고 내향적인"} 성격입니다. ` +
    `오행 중 ${oheng.strongest} 기운이 가장 강하며, ${oheng.weakest} 기운이 상대적으로 약합니다. ` +
    `${sajuResult.sipseong.dominant}이(가) 두드러져 ${dm.gan === dm.gan ? "독립적이고 주체적인 성향" : "조화를 중시하는 성향"}을 보입니다. ` +
    `${dm.isStrong ? "신강(身强)한 사주로 자신감이 넘치지만, 때로는 유연함이 필요합니다." : "신약(身弱)한 사주로 섬세한 감수성이 장점이며, 좋은 환경에서 빛납니다."}`;

  const yearKeyword = seun.keywords.length > 0
    ? `${seun.year}년 키워드: ${seun.keywords.join(", ")}`
    : `${seun.year}년은 ${seun.element} 에너지가 흐르는 해입니다.`;

  return { personalitySummary, yearKeyword };
}

/**
 * Generate a full premium report using Claude API.
 */
async function generatePremiumReport(sajuResult: SajuResult): Promise<ReportResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If no API key, return placeholder report
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set. Returning placeholder report.");
    return generatePlaceholderReport(sajuResult);
  }

  const systemPrompt = `당신은 한국 명리학(사주팔자) 전문 해석가입니다.

핵심 규칙:
1. 제공되는 사주 데이터는 만세력 엔진으로 정확히 계산된 결과입니다. 계산을 수정하거나 다시 하지 마세요.
2. 명리학 전문 용어를 적극 사용하되, 괄호 안에 쉬운 설명을 덧붙이세요.
3. 문체: 존댓말. 따뜻하면서도 분석적. 근거는 사주 데이터를 직접 인용.
4. 구조: 근거(왜) → 패턴(어떻게 나타남) → 리스크(주의) → 실행 팁(구체적 행동)
5. 금지: 의료 진단, 법률 조언, 투자 추천, 공포 조장, 단정적 표현.
6. 반복 금지. 간결하고 밀도 있게.

출력 형식: 반드시 유효한 JSON만 출력하세요.
{"title":"섹션 제목","text":"본문 내용","keywords":["키워드1","키워드2"],"highlights":["핵심 문장"]}`;

  const sectionExtras: Record<string, string> = {
    personality: "일간의 본질 성격, 월주 십성의 사회적 성격, 시주의 내면, 12운성 에너지, 오행 균형, 신살 영향, 장점3+주의점2",
    career: "식상과 관성 배치, 적합 직업 분야 3개, 대운별 커리어 전환 시기, 올해 직업운",
    love: "일지(배우자궁) 분석, 재성/관성의 연애 패턴, 도화살/홍염살 영향, 결혼 적기, 배우자 성향",
    wealth: "정재/편재 강약, 재물 들어오는 시기/방향, 투자vs저축 성향, 대운별 재물운",
    health: "약한 오행→대응 장부, 주의 시기, 건강 보완 방향 (색상/방위/음식 등), 의료 단정 금지",
    family: "연주(조상/사회), 월주(부모/성장기), 일주(배우자), 시주(자녀/말년), 육친 관계 패턴",
    past: "연주+월주로 본 초년운, 지나온 대운 흐름, 과거 경험이 현재에 미치는 영향",
    present: "현재 대운 분석, 올해(2026) 세운과 사주 상호작용, 올해 핵심 키워드, 지금 집중해야 할 것",
    future: "다가오는 대운 변화, 향후 10년 핵심 전환점, 준비해야 할 것",
    timeline: "전체 대운 흐름 요약 (10년 단위), 각 대운의 핵심 키워드와 에너지 레벨, 인생 전체 로드맵",
  };

  // Generate all sections in parallel
  const promises = SECTIONS.map(async (section): Promise<[ReportSectionKey, ReportSection]> => {
    const prompt = `다음 사주 데이터를 바탕으로 [${SECTION_TITLES[section]}] 섹션을 작성하세요.

사주 데이터:
${JSON.stringify(sajuResult, null, 2)}

공통 요구사항:
- 800~1,500자
- 근거 → 패턴 → 리스크 → 실행 팁 흐름
- 명리 용어 + 쉬운 설명 병기
- 실행 팁에 구체적 행동 1개 이상

추가 요구사항:
${sectionExtras[section]}

출력: JSON만 (코드블록 없이)
{"title":"...","text":"본문","keywords":["..."],"highlights":["핵심문장"]}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250514",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text ?? "";
      const parsed = JSON.parse(text) as ReportSection;
      return [section, parsed];
    } catch (err) {
      console.error(`Section ${section} generation failed:`, err);
      return [section, {
        title: SECTION_TITLES[section],
        text: "이 섹션의 분석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        keywords: [],
        highlights: [],
      }];
    }
  });

  const results = await Promise.all(promises);
  const sections = Object.fromEntries(results) as Record<ReportSectionKey, ReportSection>;

  return {
    sections,
    generatedAt: new Date().toISOString(),
    model: "claude-sonnet-4-5-20250514",
  };
}

/**
 * Placeholder report when API key is unavailable.
 */
function generatePlaceholderReport(sajuResult: SajuResult): ReportResult {
  const sections = Object.fromEntries(
    SECTIONS.map((key) => [
      key,
      {
        title: SECTION_TITLES[key],
        text: `${SECTION_TITLES[key]} 분석 결과입니다. 일간 ${sajuResult.dayMaster.gan}(${sajuResult.dayMaster.element}, ${sajuResult.dayMaster.yinYang})을 기반으로 상세 분석이 제공됩니다. ANTHROPIC_API_KEY를 설정하면 AI 전문 해석이 활성화됩니다.`,
        keywords: [sajuResult.dayMaster.element, sajuResult.sipseong.dominant],
        highlights: [`${sajuResult.dayMaster.nature}의 기운을 가진 사주`],
      },
    ])
  ) as Record<ReportSectionKey, ReportSection>;

  return {
    sections,
    generatedAt: new Date().toISOString(),
    model: "placeholder",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, tier } = body as { input: SajuInput; tier?: string };

    if (!input?.birthDate || !input?.birthTime || !input?.gender || !input?.calendarType) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    const sajuResult = calculateSaju(input);
    const sajuHash = generateSajuHash(
      input.birthDate, input.birthTime, input.gender, input.calendarType
    );

    const freeSummary = generateFreeSummary(sajuResult);

    let reportResult: ReportResult | null = null;
    if (tier === "premium") {
      reportResult = await generatePremiumReport(sajuResult);
    }

    // Try to persist to DB (graceful fallback if Supabase unavailable)
    let reportId: string | null = null;
    try {
      const { createReport: createDbReport } = await import("@/lib/db/queries");
      const dbReport = await createDbReport({
        sajuHash,
        input,
        sajuResult,
        reportJson: reportResult ?? undefined,
        tier: tier ?? "free",
      });
      reportId = dbReport.id;
    } catch {
      console.warn("DB not available, proceeding without persistence");
    }

    return NextResponse.json({
      reportId,
      sajuResult,
      sajuHash,
      freeSummary,
      report: reportResult,
    });
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json(
      { error: "리포트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

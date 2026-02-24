// POST /api/saju/report — Generate or retrieve a saju report

import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/engine";
import { generateSajuHash } from "@/lib/utils/hash";
import { generateReport, generatePlaceholderReport } from "@/lib/llm/parallel";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/ratelimit/limiter";
import { logLLMUsage, logRateLimit, logError, generateRequestId } from "@/lib/logging/opsLogger";
import type { SajuInput, SajuResult, ReportResult, ReportTier } from "@/lib/saju/types";

/**
 * Generate a free summary (rule-based, no LLM needed).
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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  try {
    const body = await request.json();
    const { input, tier: rawTier } = body as { input: SajuInput; tier?: string };

    if (!input?.birthDate || !input?.birthTime || !input?.gender || !input?.calendarType) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다.", code: "MISSING_INPUT" },
        { status: 400 }
      );
    }

    const tier: ReportTier = rawTier === "premium" ? "premium" : "free";

    // Rate limit check
    const rlConfig = tier === "premium" ? RATE_LIMITS.premiumReport : RATE_LIMITS.freeReport;
    const rl = checkRateLimit(request, rlConfig);
    if (!rl.allowed) {
      logRateLimit({ endpoint: "/api/saju/report", tier, ip, requestId });
      return rateLimitResponse(rl);
    }

    const sajuResult = calculateSaju(input);
    const sajuHash = generateSajuHash(
      input.birthDate, input.birthTime, input.gender, input.calendarType
    );

    const freeSummary = generateFreeSummary(sajuResult);

    // Generate LLM report (both free and premium go through the same path)
    let reportResult: ReportResult;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn("ANTHROPIC_API_KEY not set. Returning placeholder report.");
      reportResult = generatePlaceholderReport(sajuResult, tier);
    } else {
      reportResult = await generateReport(sajuResult, { tier });
    }

    // Persist to DB (required — user_id is optional for anonymous access)
    let reportId: string | null = null;
    try {
      const { createReport: createDbReport } = await import("@/lib/db/queries");
      const dbReport = await createDbReport({
        sajuHash,
        input,
        sajuResult,
        reportJson: reportResult,
        tier,
      });
      reportId = dbReport.id;
    } catch (dbErr) {
      console.error("DB persistence failed:", dbErr);
      // Still return the report but without persistence
    }

    // Log LLM usage
    if (reportResult.usage) {
      logLLMUsage({
        endpoint: "/api/saju/report",
        tier,
        sectionCount: Object.keys(reportResult.sections).length,
        inputTokens: reportResult.usage.totalInputTokens,
        outputTokens: reportResult.usage.totalOutputTokens,
        cacheWriteTokens: reportResult.usage.totalCacheWriteTokens,
        cacheReadTokens: reportResult.usage.totalCacheReadTokens,
        estimatedCostUsd: reportResult.usage.estimatedCostUsd,
        sajuHash,
        ip,
        requestId,
      });
    }

    return NextResponse.json({
      reportId,
      sajuResult,
      sajuHash,
      freeSummary,
      report: reportResult,
      tier,
      usage: reportResult.usage,
    });
  } catch (err) {
    console.error("Report generation error:", err);
    logError({
      endpoint: "/api/saju/report",
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
      ip,
      requestId,
    });
    return NextResponse.json(
      { error: "리포트 생성 중 오류가 발생했습니다.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

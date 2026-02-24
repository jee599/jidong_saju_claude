// POST /api/yearly — 연간 운세 API

import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/engine";
import { callClaudeWithRetry } from "@/lib/llm/client";
import { SYSTEM_PROMPT, getYearlyPrompt } from "@/lib/llm/prompts";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/ratelimit/limiter";
import { logLLMUsage, logRateLimit, logError, generateRequestId } from "@/lib/logging/opsLogger";
import type { SajuInput } from "@/lib/saju/types";

interface YearlyBody {
  input: SajuInput;
  year?: number;
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  try {
    // Rate limit
    const rl = checkRateLimit(request, RATE_LIMITS.yearly);
    if (!rl.allowed) {
      logRateLimit({ endpoint: "/api/yearly", ip, requestId });
      return rateLimitResponse(rl);
    }

    const body: YearlyBody = await request.json();
    const { input, year = 2026 } = body;

    if (!input?.birthDate || !input?.birthTime || !input?.gender) {
      return NextResponse.json(
        { error: "생년월일시와 성별을 입력해주세요.", code: "MISSING_INPUT" },
        { status: 400 }
      );
    }

    const sajuResult = calculateSaju({
      ...input,
      calendarType: input.calendarType || "solar",
    });

    // LLM 연간 운세 분석
    let yearlyAnalysis = null;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const prompt = getYearlyPrompt(sajuResult, year);
        const response = await callClaudeWithRetry({
          system: SYSTEM_PROMPT,
          prompt,
          maxTokens: 3000,
        });

        let text = response.text.trim();
        if (text.startsWith("```")) {
          text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        yearlyAnalysis = JSON.parse(text);

        logLLMUsage({
          endpoint: "/api/yearly",
          sectionCount: 1,
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          cacheWriteTokens: response.usage.cacheCreationInputTokens,
          cacheReadTokens: response.usage.cacheReadInputTokens,
          ip,
          requestId,
        });
      } catch (err) {
        console.error("LLM yearly analysis failed:", err);
      }
    }

    // 기본 연간 운세 (코드 기반)
    const basicYearly = generateBasicYearly(sajuResult, year);

    return NextResponse.json({
      sajuResult,
      year,
      basicYearly,
      yearlyAnalysis,
    });
  } catch (err) {
    console.error("Yearly fortune error:", err);
    logError({
      endpoint: "/api/yearly",
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
      ip,
      requestId,
    });
    return NextResponse.json(
      { error: "연간 운세 분석 중 오류가 발생했습니다.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * 코드 기반 기본 연간 운세
 */
function generateBasicYearly(
  sajuResult: ReturnType<typeof calculateSaju>,
  year: number
) {
  const seun = sajuResult.seun;
  const dm = sajuResult.dayMaster;

  return {
    year,
    seunGanji: seun.ganJi,
    seunElement: seun.element,
    seunSipseong: seun.sipseong,
    keywords: seun.keywords,
    summary: `${year}년은 ${seun.ganJi}(${seun.element})의 해입니다. ` +
      `${dm.gan} 일간에게 ${seun.sipseong}의 에너지가 흐르며, ` +
      `${seun.keywords.join(", ")}이(가) 주요 키워드입니다.`,
    yongsinAdvice: `용신 ${sajuResult.yongsin.yongsin}을(를) 보강하면 좋습니다. ` +
      `행운의 색: ${sajuResult.yongsin.luckyColors.join(", ")}, ` +
      `행운의 방위: ${sajuResult.yongsin.luckyDirections.join(", ")}`,
  };
}

// POST /api/compatibility — 궁합 분석 API

import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/engine";
import { callClaudeWithRetry } from "@/lib/llm/client";
import { SYSTEM_PROMPT, getCompatibilityPrompt } from "@/lib/llm/prompts";
import type { SajuInput } from "@/lib/saju/types";

interface CompatibilityBody {
  personA: SajuInput;
  personB: SajuInput;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompatibilityBody = await request.json();

    if (
      !body.personA?.birthDate || !body.personA?.birthTime || !body.personA?.gender ||
      !body.personB?.birthDate || !body.personB?.birthTime || !body.personB?.gender
    ) {
      return NextResponse.json(
        { error: "두 사람의 생년월일시와 성별을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 두 사주 계산
    const sajuA = calculateSaju({
      ...body.personA,
      calendarType: body.personA.calendarType || "solar",
    });
    const sajuB = calculateSaju({
      ...body.personB,
      calendarType: body.personB.calendarType || "solar",
    });

    // 기본 궁합 분석 (코드 기반)
    const basicAnalysis = analyzeBasicCompatibility(sajuA, sajuB);

    // LLM 상세 궁합 분석
    let llmAnalysis = null;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const prompt = getCompatibilityPrompt(sajuA, sajuB);
        const response = await callClaudeWithRetry({
          system: SYSTEM_PROMPT,
          prompt,
          maxTokens: 3000,
        });

        let text = response.text.trim();
        if (text.startsWith("```")) {
          text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        llmAnalysis = JSON.parse(text);
      } catch (err) {
        console.error("LLM compatibility analysis failed:", err);
      }
    }

    return NextResponse.json({
      sajuA,
      sajuB,
      basicAnalysis,
      llmAnalysis,
    });
  } catch (err) {
    console.error("Compatibility error:", err);
    return NextResponse.json(
      { error: "궁합 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 코드 기반 기본 궁합 분석
 */
function analyzeBasicCompatibility(
  sajuA: ReturnType<typeof calculateSaju>,
  sajuB: ReturnType<typeof calculateSaju>
) {
  const dmA = sajuA.dayMaster;
  const dmB = sajuB.dayMaster;

  // 일간 오행 궁합
  const ohengRelation = getOhengRelation(dmA.element, dmB.element);

  // 일지(배우자궁) 관계
  const dayJiA = sajuA.pillars.day.ji;
  const dayJiB = sajuB.pillars.day.ji;
  const jiRelation = getJijiRelation(dayJiA, dayJiB);

  // 오행 보완 관계
  const missingA = sajuA.oheng.missing;
  const missingB = sajuB.oheng.missing;
  const complementary = missingA.some((el) =>
    Object.values(sajuB.oheng.distribution).some(
      (d) => d.count > 0 && sajuB.oheng.strongest === el
    )
  );

  // 점수 계산 (100점 만점)
  let score = 50; // 기본 점수
  if (ohengRelation === "상생") score += 20;
  else if (ohengRelation === "비화") score += 10;
  else if (ohengRelation === "상극") score -= 10;

  if (jiRelation === "육합") score += 15;
  else if (jiRelation === "삼합") score += 10;
  else if (jiRelation === "충") score -= 15;
  else if (jiRelation === "형") score -= 10;

  if (complementary) score += 10;

  // 음양 조화
  if (dmA.yinYang !== dmB.yinYang) score += 5;

  score = Math.max(30, Math.min(95, score));

  return {
    score,
    dayMasterRelation: ohengRelation,
    dayJiRelation: jiRelation,
    complementary,
    summaryA: `${dmA.gan}(${dmA.element}${dmA.yinYang}) — ${dmA.nature}`,
    summaryB: `${dmB.gan}(${dmB.element}${dmB.yinYang}) — ${dmB.nature}`,
  };
}

function getOhengRelation(a: string, b: string): string {
  const generates: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  if (a === b) return "비화";
  if (generates[a] === b || generates[b] === a) return "상생";
  return "상극";
}

function getJijiRelation(a: string, b: string): string {
  const yukhap = [["子","丑"],["寅","亥"],["卯","戌"],["辰","酉"],["巳","申"],["午","未"]];
  const chung = [["子","午"],["丑","未"],["寅","申"],["卯","酉"],["辰","戌"],["巳","亥"]];

  for (const [x, y] of yukhap) {
    if ((a === x && b === y) || (a === y && b === x)) return "육합";
  }
  for (const [x, y] of chung) {
    if ((a === x && b === y) || (a === y && b === x)) return "충";
  }
  return "일반";
}

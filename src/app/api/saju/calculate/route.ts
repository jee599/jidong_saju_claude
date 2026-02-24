// POST /api/saju/calculate — Calculate saju from birth info

import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/engine";
import { generateSajuHash } from "@/lib/utils/hash";
import type { SajuInput } from "@/lib/saju/types";

interface CalculateBody {
  name?: string;
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
  isLeapMonth?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateBody = await request.json();

    // Validate required fields
    if (!body.birthDate || !body.birthTime || !body.gender || !body.calendarType) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) {
      return NextResponse.json(
        { error: "생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(body.birthTime)) {
      return NextResponse.json(
        { error: "시간 형식이 올바르지 않습니다. (HH:mm)" },
        { status: 400 }
      );
    }

    // Validate gender
    if (!["male", "female"].includes(body.gender)) {
      return NextResponse.json(
        { error: "성별은 male 또는 female이어야 합니다." },
        { status: 400 }
      );
    }

    const input: SajuInput = {
      name: body.name,
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      gender: body.gender,
      calendarType: body.calendarType,
      isLeapMonth: body.isLeapMonth,
    };

    const sajuResult = calculateSaju(input);
    const sajuHash = generateSajuHash(
      body.birthDate,
      body.birthTime,
      body.gender,
      body.calendarType
    );

    return NextResponse.json({
      sajuResult,
      sajuHash,
    });
  } catch (err) {
    console.error("Saju calculation error:", err);
    return NextResponse.json(
      { error: "사주 계산 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

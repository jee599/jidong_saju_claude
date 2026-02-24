// POST /api/payment/create — Create a payment intent

import { NextRequest, NextResponse } from "next/server";
import { PRICING } from "@/lib/payment/toss";
import { generateOrderId } from "@/lib/utils/hash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, productType } = body as {
      reportId: string;
      productType: "full" | "compatibility" | "yearly" | "all_in_one";
    };

    if (!reportId || !productType) {
      return NextResponse.json(
        { error: "reportId와 productType이 필요합니다." },
        { status: 400 }
      );
    }

    const priceMap: Record<string, number> = {
      full: PRICING.FULL_REPORT,
      compatibility: PRICING.COMPATIBILITY,
      yearly: PRICING.YEARLY,
      all_in_one: PRICING.ALL_IN_ONE,
    };

    const amount = priceMap[productType];
    if (!amount) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 유형입니다." },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const orderName = {
      full: "운명사주 풀 리포트",
      compatibility: "운명사주 궁합 분석",
      yearly: "운명사주 연간 운세",
      all_in_one: "운명사주 올인원 패키지",
    }[productType];

    const clientKey = process.env.TOSS_CLIENT_KEY ?? "";

    // Try to persist payment record to DB
    try {
      const { createPayment } = await import("@/lib/db/queries");
      await createPayment({
        reportId,
        amount,
        orderId,
      });
    } catch {
      console.warn("DB not available, proceeding without payment record");
    }

    return NextResponse.json({
      orderId,
      amount,
      orderName,
      clientKey,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/payment/confirm?reportId=${reportId}`,
      failUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/report/${reportId}?payment=failed`,
    });
  } catch (err) {
    console.error("Payment creation error:", err);
    return NextResponse.json(
      { error: "결제 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

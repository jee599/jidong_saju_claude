// GET /api/payment/confirm — Toss Payments success callback

import { NextRequest, NextResponse } from "next/server";
import { confirmTossPayment } from "@/lib/payment/toss";
import { logPayment, logError, generateRequestId } from "@/lib/logging/opsLogger";

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const searchParams = request.nextUrl.searchParams;
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const reportId = searchParams.get("reportId");

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(
      new URL(`/report/${reportId ?? "error"}?payment=failed&reason=missing_params`, request.url)
    );
  }

  try {
    // Confirm with Toss API
    await confirmTossPayment({
      paymentKey,
      orderId,
      amount: parseInt(amount, 10),
    });

    // Update DB records
    try {
      const { confirmPayment, updateReportTier } = await import("@/lib/db/queries");
      const payment = await confirmPayment(orderId, paymentKey);

      if (payment.report_id) {
        await updateReportTier(payment.report_id, "premium");
      }
    } catch {
      console.warn("DB update failed after payment confirmation");
    }

    logPayment({
      endpoint: "/api/payment/confirm",
      statusCode: 200,
      amount: parseInt(amount, 10),
      orderId: orderId,
      ip,
      requestId,
    });

    // Redirect to report page with success
    return NextResponse.redirect(
      new URL(`/report/${reportId ?? "success"}?payment=success`, request.url)
    );
  } catch (err) {
    console.error("Payment confirmation error:", err);
    logError({
      endpoint: "/api/payment/confirm",
      statusCode: 500,
      errorCode: "PAYMENT_CONFIRM_ERROR",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
      ip,
      requestId,
    });
    return NextResponse.redirect(
      new URL(`/report/${reportId ?? "error"}?payment=failed&reason=confirm_error`, request.url)
    );
  }
}

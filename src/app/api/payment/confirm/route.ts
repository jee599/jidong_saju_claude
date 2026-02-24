// GET /api/payment/confirm — Toss Payments success callback

import { NextRequest, NextResponse } from "next/server";
import { confirmTossPayment } from "@/lib/payment/toss";

export async function GET(request: NextRequest) {
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

    // Redirect to report page with success
    return NextResponse.redirect(
      new URL(`/report/${reportId ?? "success"}?payment=success`, request.url)
    );
  } catch (err) {
    console.error("Payment confirmation error:", err);
    return NextResponse.redirect(
      new URL(`/report/${reportId ?? "error"}?payment=failed&reason=confirm_error`, request.url)
    );
  }
}

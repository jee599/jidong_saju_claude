// POST /api/payment/webhook — Toss Payments webhook handler

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body as {
      eventType: string;
      data: {
        paymentKey: string;
        orderId: string;
        status: string;
      };
    };

    console.log(`[Toss Webhook] ${eventType}:`, data.orderId);

    switch (eventType) {
      case "PAYMENT_STATUS_CHANGED": {
        if (data.status === "DONE") {
          try {
            const { confirmPayment, updateReportTier } = await import("@/lib/db/queries");
            const payment = await confirmPayment(data.orderId, data.paymentKey);
            if (payment.report_id) {
              await updateReportTier(payment.report_id, "premium");
            }
          } catch {
            console.warn("DB update failed in webhook");
          }
        }
        break;
      }
      case "PAYMENT_CANCELED":
      case "PAYMENT_PARTIAL_CANCELED": {
        try {
          const { getPaymentByOrderId } = await import("@/lib/db/queries");
          const payment = await getPaymentByOrderId(data.orderId);
          if (payment) {
            // TODO: Handle cancellation — revert report tier
            console.log(`Payment cancelled: ${data.orderId}`);
          }
        } catch {
          console.warn("DB check failed in webhook");
        }
        break;
      }
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

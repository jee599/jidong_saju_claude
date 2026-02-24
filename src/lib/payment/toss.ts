// src/lib/payment/toss.ts — Toss Payments integration

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

export interface TossPaymentRequest {
  orderId: string;
  amount: number;
  orderName: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
}

export interface TossConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt?: string;
}

/**
 * Confirm a payment with Toss Payments API.
 * Called after user completes payment on Toss widget.
 */
export async function confirmTossPayment(
  params: TossConfirmRequest
): Promise<TossPaymentResponse> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing TOSS_SECRET_KEY environment variable");
  }

  const authorization = Buffer.from(`${secretKey}:`).toString("base64");

  const response = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: params.amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Toss payment confirm failed: ${(error as Record<string, string>).message ?? response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get Toss client key for frontend widget.
 */
export function getTossClientKey(): string {
  const key = process.env.TOSS_CLIENT_KEY;
  if (!key) {
    throw new Error("Missing TOSS_CLIENT_KEY environment variable");
  }
  return key;
}

/**
 * Pricing constants.
 */
export const PRICING = {
  FULL_REPORT: 5900,
  COMPATIBILITY: 7900,
  YEARLY: 4900,
  ALL_IN_ONE: 14900,
} as const;

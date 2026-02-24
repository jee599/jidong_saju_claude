// src/hooks/usePayment.ts — 결제 훅

"use client";

import { useState, useCallback } from "react";

interface PaymentInfo {
  orderId: string;
  amount: number;
  orderName: string;
  clientKey: string;
  successUrl: string;
  failUrl: string;
}

interface UsePaymentReturn {
  paymentInfo: PaymentInfo | null;
  loading: boolean;
  error: string | null;
  createPayment: (
    reportId: string,
    productType: "full" | "compatibility" | "yearly" | "all_in_one"
  ) => Promise<PaymentInfo | null>;
}

export function usePayment(): UsePaymentReturn {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(
    async (
      reportId: string,
      productType: "full" | "compatibility" | "yearly" | "all_in_one"
    ) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, productType }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "결제 생성에 실패했습니다.");
        }

        const data: PaymentInfo = await res.json();
        setPaymentInfo(data);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "알 수 없는 오류";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { paymentInfo, loading, error, createPayment };
}

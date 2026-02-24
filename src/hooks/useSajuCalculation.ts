// src/hooks/useSajuCalculation.ts — 사주 계산 훅

"use client";

import { useState, useCallback } from "react";
import type { SajuInput, SajuResult } from "@/lib/saju/types";

interface UseSajuCalculationReturn {
  sajuResult: SajuResult | null;
  sajuHash: string | null;
  loading: boolean;
  error: string | null;
  calculate: (input: SajuInput) => Promise<void>;
}

export function useSajuCalculation(): UseSajuCalculationReturn {
  const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);
  const [sajuHash, setSajuHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (input: SajuInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/saju/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "사주 계산에 실패했습니다.");
      }

      const data = await res.json();
      setSajuResult(data.sajuResult);
      setSajuHash(data.sajuHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  return { sajuResult, sajuHash, loading, error, calculate };
}

// src/hooks/useReportGeneration.ts — 리포트 생성 훅

"use client";

import { useState, useCallback } from "react";
import type { SajuInput, SajuResult, ReportResult, ReportTier, UsageStats } from "@/lib/saju/types";

interface ReportResponse {
  reportId: string | null;
  sajuResult: SajuResult;
  sajuHash: string;
  freeSummary: { personalitySummary: string; yearKeyword: string };
  report: ReportResult | null;
  tier: ReportTier;
  usage?: UsageStats;
}

interface UseReportGenerationReturn {
  data: ReportResponse | null;
  loading: boolean;
  error: string | null;
  generate: (input: SajuInput, tier?: "free" | "premium") => Promise<ReportResponse | null>;
}

export function useReportGeneration(): UseReportGenerationReturn {
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (input: SajuInput, tier: "free" | "premium" = "free") => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/saju/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, tier }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "리포트 생성에 실패했습니다.");
        }

        const result: ReportResponse = await res.json();
        setData(result);
        return result;
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

  return { data, loading, error, generate };
}

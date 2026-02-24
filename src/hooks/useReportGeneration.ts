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

interface ApiError {
  error: string;
  code?: string;
  retryAfter?: number;
}

interface UseReportGenerationReturn {
  data: ReportResponse | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  retryAfter: number | null;
  generate: (input: SajuInput, tier?: "free" | "premium") => Promise<ReportResponse | null>;
}

const ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  MISSING_INPUT: "필수 입력값이 누락되었습니다.",
  INTERNAL_ERROR: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
  TIMEOUT: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
};

export function useReportGeneration(): UseReportGenerationReturn {
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const generate = useCallback(
    async (input: SajuInput, tier: "free" | "premium" = "free") => {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      setRetryAfter(null);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout

        let res: Response;
        try {
          res = await fetch("/api/saju/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input, tier }),
            signal: controller.signal,
          });
        } catch (fetchErr) {
          clearTimeout(timeout);
          if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
            setError(ERROR_MESSAGES.TIMEOUT);
            setErrorCode("TIMEOUT");
            return null;
          }
          setError(ERROR_MESSAGES.NETWORK_ERROR);
          setErrorCode("NETWORK_ERROR");
          return null;
        }
        clearTimeout(timeout);

        if (!res.ok) {
          const errData: ApiError = await res.json().catch(() => ({
            error: "알 수 없는 오류가 발생했습니다.",
          }));

          const code = errData.code ?? (res.status === 429 ? "RATE_LIMITED" : "INTERNAL_ERROR");
          const message = ERROR_MESSAGES[code] ?? errData.error ?? "오류가 발생했습니다.";

          setError(message);
          setErrorCode(code);

          if (errData.retryAfter) {
            setRetryAfter(errData.retryAfter);
          }

          return null;
        }

        const result: ReportResponse = await res.json();
        setData(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "알 수 없는 오류";
        setError(msg);
        setErrorCode("UNKNOWN");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, errorCode, retryAfter, generate };
}

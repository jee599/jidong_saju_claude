"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import type { SajuResult, ReportResult, ReportTier, UsageStats } from "@/lib/saju/types";

function NewReportContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);
  const [phase, setPhase] = useState<"calculating" | "generating" | "done">("calculating");
  const [error, setError] = useState("");

  useEffect(() => {
    const birthDate = params.get("date");
    const birthTime = params.get("time");
    const gender = params.get("gender");
    const calendarType = params.get("calendar") ?? "solar";
    const name = params.get("name") ?? "";

    if (!birthDate || !birthTime || !gender) {
      setError("필수 입력값이 누락되었습니다.");
      return;
    }

    generateReport({
      name,
      birthDate,
      birthTime,
      gender: gender as "male" | "female",
      calendarType: calendarType as "solar" | "lunar",
    });
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generateReport(input: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: "male" | "female";
    calendarType: "solar" | "lunar";
  }) {
    try {
      setPhase("calculating");

      const calcResponse = await fetch("/api/saju/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!calcResponse.ok) {
        const err = await calcResponse.json();
        throw new Error(err.error ?? "계산 실패");
      }

      const { sajuResult: result } = await calcResponse.json();
      setSajuResult(result);

      // Wait for pillar animation
      await new Promise((r) => setTimeout(r, 3500));

      setPhase("generating");

      const reportResponse = await fetch("/api/saju/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, tier: "free" }),
      });

      if (!reportResponse.ok) {
        throw new Error("리포트 생성 실패");
      }

      const data = await reportResponse.json() as {
        reportId: string | null;
        sajuResult: SajuResult;
        sajuHash: string;
        freeSummary: { personalitySummary: string; yearKeyword: string };
        report: ReportResult | null;
        tier: ReportTier;
        usage?: UsageStats;
      };
      setPhase("done");

      await new Promise((r) => setTimeout(r, 500));

      if (data.reportId) {
        router.replace(`/report/${data.reportId}`);
      } else {
        // DB unavailable — store in sessionStorage and use local viewer
        sessionStorage.setItem("fatesaju_local_report", JSON.stringify(data));
        router.replace("/report/local");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  }

  if (error) {
    return <ErrorFallback error={error} onRetry={() => router.push("/input")} />;
  }

  return (
    <LoadingScreen
      sajuResult={sajuResult}
      phase={phase}
    />
  );
}

export default function NewReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-base flex items-center justify-center">
          <div className="text-text-secondary text-sm animate-pulse">준비 중...</div>
        </div>
      }
    >
      <NewReportContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { SajuResult, ReportResult, ReportSectionKey } from "@/lib/saju/types";
import { PillarCard } from "@/components/report/PillarCard";
import { OhengChart } from "@/components/report/OhengChart";
import { DaeunTimeline } from "@/components/report/DaeunTimeline";
import { SectionCard } from "@/components/report/SectionCard";
import { ShareCard } from "@/components/report/ShareCard";
import { PaywallCTA } from "@/components/report/PaywallCTA";
import { Header } from "@/components/common/Header";

interface ReportData {
  reportId: string | null;
  sajuResult: SajuResult;
  sajuHash: string;
  freeSummary: { personalitySummary: string; yearKeyword: string };
  report: ReportResult | null;
  tier?: string;
}

const FREE_SECTIONS: ReportSectionKey[] = ["personality", "present"];
const SECTION_ORDER: ReportSectionKey[] = [
  "personality", "career", "love", "wealth", "health",
  "family", "past", "present", "future", "timeline",
];

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const isPremium = data?.tier === "premium" || (data?.report?.model !== "placeholder" && data?.report !== null && data?.tier !== "free");

  useEffect(() => {
    if (id === "local") {
      // Load from sessionStorage (no DB mode)
      const stored = sessionStorage.getItem("saju_report");
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        setError("리포트 데이터를 찾을 수 없습니다.");
      }
      setLoading(false);
      return;
    }

    // TODO: Fetch from DB when Supabase is configured
    // For now, try sessionStorage fallback
    const stored = sessionStorage.getItem("saju_report");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      setError("리포트를 불러올 수 없습니다. 다시 분석해주세요.");
    }
    setLoading(false);
  }, [id]);

  const handlePurchase = async () => {
    if (!data?.reportId) {
      // No DB mode — generate premium report directly
      setPaymentLoading(true);
      try {
        const response = await fetch("/api/saju/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: data?.sajuResult.input,
            tier: "premium",
          }),
        });
        const result = await response.json();
        if (result.report) {
          setData((prev) => prev ? { ...prev, report: result.report, tier: "premium" } : prev);
        }
      } catch {
        alert("결제 처리 중 오류가 발생했습니다.");
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    // Real payment flow
    setPaymentLoading(true);
    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: data.reportId,
          productType: "full",
        }),
      });
      const paymentData = await response.json();

      if (paymentData.clientKey) {
        // Redirect to Toss payment page
        // TODO: Integrate TossPayments SDK widget
        window.location.href = `https://pay.toss.im/paymentWidget?clientKey=${paymentData.clientKey}&orderId=${paymentData.orderId}&amount=${paymentData.amount}&orderName=${encodeURIComponent(paymentData.orderName)}&successUrl=${encodeURIComponent(paymentData.successUrl)}&failUrl=${encodeURIComponent(paymentData.failUrl)}`;
      }
    } catch {
      alert("결제 준비 중 오류가 발생했습니다.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0B1A] flex items-center justify-center">
        <div className="text-[#8B85A0] text-sm animate-pulse">리포트를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0D0B1A] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#E74C3C] mb-4">{error}</p>
          <Link href="/input" className="text-[#6C3CE1] text-sm hover:underline">
            새로 분석하기
          </Link>
        </div>
      </div>
    );
  }

  const { sajuResult, freeSummary, report } = data;
  const dm = sajuResult.dayMaster;
  const reportUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-[#0D0B1A]">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-12">
        {/* Name & Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {sajuResult.input.name && (
            <p className="text-[#D4A84B] text-sm mb-1">{sajuResult.input.name}님의</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E8E4F0]">
            사주팔자 분석 리포트
          </h1>
          <p className="text-[#8B85A0] text-xs mt-2">
            {sajuResult.input.birthDate} · {sajuResult.input.birthTime} · {sajuResult.input.gender === "male" ? "남" : "여"}
          </p>
        </motion.div>

        {/* 4 Pillars */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-[#E8E4F0] mb-3">사주팔자 (四柱八字)</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <PillarCard
              pillar={sajuResult.pillars.year}
              label="연주"
              delay={0}
              sipseong={sajuResult.sipseong.details?.yearGan}
              unseong={sajuResult.unseong.yearJi}
            />
            <PillarCard
              pillar={sajuResult.pillars.month}
              label="월주"
              delay={0.1}
              sipseong={sajuResult.sipseong.details?.monthGan}
              unseong={sajuResult.unseong.monthJi}
            />
            <PillarCard
              pillar={sajuResult.pillars.day}
              label="일주"
              isDayMaster
              delay={0.2}
              sipseong="일주"
              unseong={sajuResult.unseong.dayJi}
            />
            <PillarCard
              pillar={sajuResult.pillars.hour}
              label="시주"
              delay={0.3}
              sipseong={sajuResult.sipseong.details?.hourGan}
              unseong={sajuResult.unseong.hourJi}
            />
          </div>
        </section>

        {/* Day Master Info */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 bg-[#1E1A3A] rounded-2xl p-4 sm:p-5 border border-white/5"
        >
          <h3 className="text-sm font-bold text-[#E8E4F0] mb-3">일간(日干) 정보</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#8B85A0] text-xs">일간</span>
              <p className="text-[#E8E4F0] font-bold font-hanja text-lg">
                {dm.gan} <span className="text-xs font-sans font-normal text-[#8B85A0]">({dm.nature})</span>
              </p>
            </div>
            <div>
              <span className="text-[#8B85A0] text-xs">오행</span>
              <p className="text-[#E8E4F0]">{dm.element} ({dm.yinYang})</p>
            </div>
            <div>
              <span className="text-[#8B85A0] text-xs">신강/신약</span>
              <p className="text-[#E8E4F0]">{dm.isStrong ? "신강(身强)" : "신약(身弱)"}</p>
            </div>
            <div>
              <span className="text-[#8B85A0] text-xs">용신</span>
              <p className="text-[#E8E4F0]">{sajuResult.yongsin.yongsin}</p>
            </div>
          </div>
          <p className="text-xs text-[#8B85A0] mt-3 leading-relaxed">
            {dm.strengthReason}
          </p>
        </motion.section>

        {/* Oheng Chart */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <OhengChart oheng={sajuResult.oheng} />
        </motion.section>

        {/* Free Summary */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 bg-[#1E1A3A] rounded-2xl p-4 sm:p-5 border border-white/5"
        >
          <h3 className="text-sm font-bold text-[#E8E4F0] mb-3">성격 요약</h3>
          <p className="text-sm text-[#E8E4F0]/85 leading-relaxed">
            {freeSummary.personalitySummary}
          </p>
          <p className="text-sm text-[#D4A84B] mt-3">
            {freeSummary.yearKeyword}
          </p>
        </motion.section>

        {/* Yongsin Lucky Info */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8 bg-[#1E1A3A] rounded-2xl p-4 sm:p-5 border border-white/5"
        >
          <h3 className="text-sm font-bold text-[#E8E4F0] mb-3">행운의 정보</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[#8B85A0] text-[10px] block mb-1">행운의 색</span>
              <p className="text-xs text-[#E8E4F0]">{sajuResult.yongsin.luckyColors.join(", ")}</p>
            </div>
            <div>
              <span className="text-[#8B85A0] text-[10px] block mb-1">행운의 방위</span>
              <p className="text-xs text-[#E8E4F0]">{sajuResult.yongsin.luckyDirections.join(", ")}</p>
            </div>
            <div>
              <span className="text-[#8B85A0] text-[10px] block mb-1">행운의 숫자</span>
              <p className="text-xs text-[#E8E4F0]">{sajuResult.yongsin.luckyNumbers.join(", ")}</p>
            </div>
          </div>
        </motion.section>

        {/* Sinsals */}
        {sajuResult.sinsals.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8 bg-[#1E1A3A] rounded-2xl p-4 sm:p-5 border border-white/5"
          >
            <h3 className="text-sm font-bold text-[#E8E4F0] mb-3">신살(神煞)</h3>
            <div className="space-y-2">
              {sajuResult.sinsals.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                    s.type === "길신"
                      ? "bg-[#2ECC71]/15 text-[#2ECC71]"
                      : "bg-[#E74C3C]/15 text-[#E74C3C]"
                  }`}>
                    {s.type}
                  </span>
                  <div>
                    <span className="text-xs text-[#E8E4F0] font-medium">{s.name}</span>
                    <span className="text-[10px] text-[#8B85A0] ml-1">({s.location})</span>
                    <p className="text-[10px] text-[#8B85A0]">{s.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Daeun Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <DaeunTimeline daeun={sajuResult.daeun} />
        </motion.section>

        {/* Premium Report Sections */}
        {report && isPremium ? (
          <section className="mb-8 space-y-4">
            <h2 className="text-sm font-bold text-[#D4A84B] mb-2">상세 분석 리포트</h2>
            {SECTION_ORDER.map((key, i) => (
              report.sections[key] && (
                <SectionCard
                  key={key}
                  section={report.sections[key]}
                  index={i}
                />
              )
            ))}
          </section>
        ) : (
          <section className="mb-8 space-y-4">
            {/* Show locked preview of premium sections */}
            {report && FREE_SECTIONS.map((key, i) => (
              report.sections[key] && (
                <SectionCard
                  key={key}
                  section={report.sections[key]}
                  index={i}
                />
              )
            ))}

            {/* Paywall */}
            <PaywallCTA onPurchase={handlePurchase} loading={paymentLoading} />

            {/* Locked sections preview */}
            {SECTION_ORDER.filter(k => !FREE_SECTIONS.includes(k)).map((key, i) => (
              <SectionCard
                key={key}
                section={{
                  title: ({
                    personality: "성격과 기질",
                    career: "직업과 적성",
                    love: "연애와 결혼",
                    wealth: "금전과 재물",
                    health: "건강",
                    family: "가족과 대인관계",
                    past: "과거 (초년운)",
                    present: "현재",
                    future: "미래 전망",
                    timeline: "대운 타임라인 분석",
                  } as Record<string, string>)[key] ?? key,
                  text: "이 섹션은 풀 리포트에서 확인할 수 있습니다. 전문 명리학 분석으로 상세한 해석과 실행 팁을 제공합니다.",
                  keywords: [],
                  highlights: [],
                }}
                isLocked
                index={i + FREE_SECTIONS.length}
              />
            ))}
          </section>
        )}

        {/* Share */}
        <section className="mb-8">
          <ShareCard sajuResult={sajuResult} reportUrl={reportUrl} />
        </section>

        {/* Interactions */}
        {(sajuResult.interactions.haps.length > 0 || sajuResult.interactions.chungs.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-[#1E1A3A] rounded-2xl p-4 sm:p-5 border border-white/5"
          >
            <h3 className="text-sm font-bold text-[#E8E4F0] mb-3">합충형파해</h3>
            <div className="space-y-2 text-xs">
              {sajuResult.interactions.haps.map((h, i) => (
                <div key={`hap-${i}`} className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] text-[10px]">
                    {h.type}
                  </span>
                  <span className="text-[#E8E4F0]">{h.elements.join(" + ")}</span>
                  <span className="text-[#8B85A0]">{h.description}</span>
                </div>
              ))}
              {sajuResult.interactions.chungs.map((c, i) => (
                <div key={`chung-${i}`} className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#E74C3C]/15 text-[#E74C3C] text-[10px]">
                    {c.type}
                  </span>
                  <span className="text-[#E8E4F0]">{c.elements.join(" + ")}</span>
                  <span className="text-[#8B85A0]">{c.description}</span>
                </div>
              ))}
              {sajuResult.interactions.hyeongs.map((h, i) => (
                <div key={`hyeong-${i}`} className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#FFC107]/15 text-[#FFC107] text-[10px]">
                    {h.type}
                  </span>
                  <span className="text-[#E8E4F0]">{h.elements.join(" + ")}</span>
                  <span className="text-[#8B85A0]">{h.description}</span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Footer CTA */}
        <div className="text-center pt-4 pb-8">
          <Link
            href="/input"
            className="text-[#6C3CE1] text-sm hover:underline"
          >
            다른 사주 분석하기 &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}

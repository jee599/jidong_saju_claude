// src/app/compatibility/result/page.tsx — 궁합 결과 페이지

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { PillarCard } from "@/components/report/PillarCard";
import { OhengChart } from "@/components/report/OhengChart";

export default function CompatibilityResultPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("compatibility_result");
    if (stored) setData(JSON.parse(stored));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0D0B1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#E8E4F0] mb-4">궁합 데이터를 찾을 수 없습니다.</p>
          <Link href="/compatibility" className="text-[#6C3CE1] underline text-sm">다시 분석하기</Link>
        </div>
      </div>
    );
  }

  const { sajuA, sajuB, basicAnalysis, llmAnalysis } = data as {
    sajuA: Record<string, unknown>;
    sajuB: Record<string, unknown>;
    basicAnalysis: {
      score: number;
      dayMasterRelation: string;
      dayJiRelation: string;
      complementary: boolean;
      summaryA: string;
      summaryB: string;
    };
    llmAnalysis: {
      title: string;
      score: number;
      summary: string;
      strengths: string[];
      cautions: string[];
      text: string;
      keywords: string[];
    } | null;
  };

  const score = llmAnalysis?.score ?? basicAnalysis.score;
  const pillarsA = (sajuA as unknown as { pillars: Record<string, unknown> }).pillars as Record<string, { gan: string; ji: string; ganInfo: unknown; jiInfo: unknown }>;
  const pillarsB = (sajuB as unknown as { pillars: Record<string, unknown> }).pillars as Record<string, { gan: string; ji: string; ganInfo: unknown; jiInfo: unknown }>;

  return (
    <div className="min-h-screen bg-[#0D0B1A]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-[#E8E4F0] mb-4">궁합 분석 결과</h1>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1E1A3A" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="50" fill="none"
                stroke={score >= 70 ? "#2ECC71" : score >= 50 ? "#D4A84B" : "#E74C3C"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 314} 314`}
                initial={{ strokeDasharray: "0 314" }}
                animate={{ strokeDasharray: `${(score / 100) * 314} 314` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#E8E4F0]">{score}</span>
            </div>
          </div>
          <p className="text-sm text-[#8B85A0]">
            {score >= 80 ? "천생연분! 서로를 완벽하게 보완하는 궁합" :
             score >= 60 ? "좋은 궁합! 서로의 장점을 살릴 수 있어요" :
             score >= 40 ? "무난한 궁합. 노력으로 더 좋아질 수 있어요" :
             "도전적인 궁합. 이해와 배려가 필요해요"}
          </p>
        </motion.div>

        {/* Two pillars side by side */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-xs text-[#D4A84B] text-center mb-2">{basicAnalysis.summaryA}</p>
            <div className="grid grid-cols-4 gap-1">
              {(["year", "month", "day", "hour"] as const).map((pos) => (
                <PillarCard
                  key={`a-${pos}`}
                  pillar={pillarsA[pos] as unknown as { gan: string; ji: string; ganInfo: Record<string, unknown>; jiInfo: Record<string, unknown> }}
                  label={({ year: "연", month: "월", day: "일", hour: "시" } as const)[pos]}
                  isDayMaster={pos === "day"}
                  delay={0}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#D4A84B] text-center mb-2">{basicAnalysis.summaryB}</p>
            <div className="grid grid-cols-4 gap-1">
              {(["year", "month", "day", "hour"] as const).map((pos) => (
                <PillarCard
                  key={`b-${pos}`}
                  pillar={pillarsB[pos] as unknown as { gan: string; ji: string; ganInfo: Record<string, unknown>; jiInfo: Record<string, unknown> }}
                  label={({ year: "연", month: "월", day: "일", hour: "시" } as const)[pos]}
                  isDayMaster={pos === "day"}
                  delay={0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Basic analysis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1A3A] rounded-2xl p-5 border border-white/5 mb-6"
        >
          <h3 className="text-sm font-bold text-[#E8E4F0] mb-3">기본 궁합 분석</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8B85A0]">일간 관계</span>
              <span className="text-[#E8E4F0]">{basicAnalysis.dayMasterRelation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B85A0]">일지(배우자궁) 관계</span>
              <span className="text-[#E8E4F0]">{basicAnalysis.dayJiRelation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B85A0]">오행 보완</span>
              <span className={basicAnalysis.complementary ? "text-[#2ECC71]" : "text-[#8B85A0]"}>
                {basicAnalysis.complementary ? "서로 보완됨" : "해당 없음"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* LLM Analysis */}
        {llmAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1E1A3A] rounded-2xl p-5 border border-white/5 mb-6"
          >
            <h3 className="text-sm font-bold text-[#E8E4F0] mb-3">{llmAnalysis.title}</h3>
            {llmAnalysis.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {llmAnalysis.keywords.map((kw, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C3CE1]/15 text-[#6C3CE1]">
                    {kw}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-[#E8E4F0]/85 leading-relaxed whitespace-pre-line mb-4">
              {llmAnalysis.text}
            </p>
            {llmAnalysis.strengths?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-[#2ECC71] font-bold mb-1">장점</p>
                {llmAnalysis.strengths.map((s, i) => (
                  <p key={i} className="text-xs text-[#8B85A0] ml-2">• {s}</p>
                ))}
              </div>
            )}
            {llmAnalysis.cautions?.length > 0 && (
              <div>
                <p className="text-xs text-[#E74C3C] font-bold mb-1">주의점</p>
                {llmAnalysis.cautions.map((c, i) => (
                  <p key={i} className="text-xs text-[#8B85A0] ml-2">• {c}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center pt-4">
          <Link href="/compatibility" className="text-[#6C3CE1] text-sm hover:underline">
            다른 궁합 분석하기 &rarr;
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

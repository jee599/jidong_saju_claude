// src/app/yearly/result/page.tsx — 연간 운세 결과 페이지

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

interface MonthlyFortune {
  month: number;
  text: string;
  energy: number;
}

export default function YearlyResultPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("yearly_result");
    if (stored) setData(JSON.parse(stored));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">연간 운세 데이터를 찾을 수 없습니다.</p>
          <Link href="/yearly" className="text-brand-light underline text-sm">다시 분석하기</Link>
        </div>
      </div>
    );
  }

  const { year, basicYearly, yearlyAnalysis } = data as {
    year: number;
    basicYearly: {
      seunGanji: string;
      seunElement: string;
      seunSipseong: string;
      keywords: string[];
      summary: string;
      yongsinAdvice: string;
    };
    yearlyAnalysis: {
      title: string;
      yearKeywords: string[];
      summary: string;
      months: MonthlyFortune[];
      turningPoints: string[];
      bestMonths: number[];
      cautionMonths: number[];
    } | null;
  };

  const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  return (
    <div className="min-h-screen bg-bg-base">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">{year}년 연간 운세</h1>
          <p className="text-lg font-hanja text-accent">{basicYearly.seunGanji}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {basicYearly.keywords.map((kw, i) => (
              <span key={i} className="text-[10px] px-3 py-1 rounded-full bg-brand-muted text-brand-light">
                {kw}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 기본 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-elevated rounded-2xl p-5 border border-border mb-6 shadow-elevation-1"
        >
          <h3 className="text-sm font-bold text-text-primary mb-3">연간 요약</h3>
          <p className="text-sm text-text-primary/85 leading-relaxed">{basicYearly.summary}</p>
          <p className="text-xs text-accent mt-3">{basicYearly.yongsinAdvice}</p>
        </motion.div>

        {/* LLM 월별 운세 */}
        {yearlyAnalysis?.months && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-elevated rounded-2xl p-5 border border-border mb-6 shadow-elevation-1"
          >
            <h3 className="text-sm font-bold text-text-primary mb-4">월별 운세</h3>
            <div className="space-y-3">
              {yearlyAnalysis.months.map((m) => {
                const isBest = yearlyAnalysis.bestMonths?.includes(m.month);
                const isCaution = yearlyAnalysis.cautionMonths?.includes(m.month);

                return (
                  <div key={m.month} className="flex items-start gap-3">
                    <span className={`text-xs font-bold w-8 shrink-0 ${
                      isBest ? "text-success" : isCaution ? "text-danger" : "text-text-secondary"
                    }`}>
                      {MONTH_NAMES[m.month - 1]}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Energy bar */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-sm ${
                                level <= m.energy
                                  ? m.energy >= 4 ? "bg-success" : m.energy >= 3 ? "bg-accent" : "bg-danger"
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                        {isBest && <span className="text-[9px] text-success">좋은 달</span>}
                        {isCaution && <span className="text-[9px] text-danger">주의</span>}
                      </div>
                      <p className="text-xs text-text-primary/85">{m.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 전환점 */}
        {yearlyAnalysis?.turningPoints && yearlyAnalysis.turningPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-elevated rounded-2xl p-5 border border-border mb-6 shadow-elevation-1"
          >
            <h3 className="text-sm font-bold text-text-primary mb-3">주요 전환점</h3>
            {yearlyAnalysis.turningPoints.map((tp, i) => (
              <p key={i} className="text-xs text-text-secondary flex items-start gap-2 mt-1">
                <span className="text-accent shrink-0">&#9733;</span> {tp}
              </p>
            ))}
          </motion.div>
        )}

        {/* LLM 상세 분석 */}
        {yearlyAnalysis?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-elevated rounded-2xl p-5 border border-border mb-6 shadow-elevation-1"
          >
            <h3 className="text-sm font-bold text-text-primary mb-3">상세 분석</h3>
            <p className="text-sm text-text-primary/85 leading-relaxed whitespace-pre-line">
              {yearlyAnalysis.summary}
            </p>
          </motion.div>
        )}

        <div className="text-center pt-4">
          <Link href="/yearly" className="text-brand-light text-sm hover:underline">
            다시 분석하기 &rarr;
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

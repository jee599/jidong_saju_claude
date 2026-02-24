"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SajuResult } from "@/lib/saju/types";
import { PillarCard } from "@/components/report/PillarCard";

const CALC_STEPS = [
  "생년월일시를 확인하고 있습니다...",
  "음력으로 변환하고 있습니다...",
  "절기를 확인하고 있습니다...",
  "사주팔자를 세우고 있습니다...",
];

const TIPS = [
  "사주의 '日干(일간)'은 나 자신을 의미합니다. 나머지 7글자는 나를 둘러싼 환경이에요.",
  "'대운'은 10년마다 바뀌는 인생의 큰 흐름입니다.",
  "오행(五行)은 목·화·토·금·수 다섯 가지 에너지의 균형입니다.",
  "'십성(十星)'은 일간과 다른 글자의 관계를 나타냅니다.",
  "사주는 운명의 결정이 아니라 타고난 에너지 패턴의 지도입니다.",
  "'용신(用神)'은 사주에서 가장 필요한 오행입니다.",
  "연주는 조상, 월주는 부모, 일주는 나, 시주는 자녀를 봅니다.",
];

interface LoadingScreenProps {
  sajuResult: SajuResult | null;
  phase: "calculating" | "generating" | "done";
  sectionsCompleted?: number;
  totalSections?: number;
}

export function LoadingScreen({ sajuResult, phase, sectionsCompleted = 0, totalSections = 10 }: LoadingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [showPillars, setShowPillars] = useState(false);

  useEffect(() => {
    if (phase !== "calculating") return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= CALC_STEPS.length - 1) {
          clearInterval(timer);
          setShowPillars(true);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const progress = phase === "calculating"
    ? (stepIndex / CALC_STEPS.length) * 30
    : phase === "generating"
    ? 30 + (sectionsCompleted / totalSections) * 70
    : 100;

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase === "calculating" ? stepIndex : "gen"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center text-text-primary text-sm mb-8"
          >
            {phase === "calculating"
              ? CALC_STEPS[stepIndex]
              : phase === "generating"
              ? `AI가 분석하고 있습니다... (${sectionsCompleted}/${totalSections})`
              : "분석이 완료되었습니다!"}
          </motion.p>
        </AnimatePresence>

        {/* Pillar cards reveal */}
        {showPillars && sajuResult && (
          <div className="grid grid-cols-4 gap-2 mb-8">
            <PillarCard pillar={sajuResult.pillars.year} label="연주" delay={0} />
            <PillarCard pillar={sajuResult.pillars.month} label="월주" delay={0.4} />
            <PillarCard pillar={sajuResult.pillars.day} label="일주" isDayMaster delay={0.8} />
            <PillarCard pillar={sajuResult.pillars.hour} label="시주" delay={1.2} />
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-center text-[10px] text-text-secondary mb-8">
          {Math.round(progress)}% 완료
        </p>

        {/* Mini tips */}
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs text-text-secondary bg-bg-elevated rounded-xl px-4 py-3 border border-border shadow-elevation-1"
          >
            {TIPS[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

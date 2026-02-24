"use client";

import { motion } from "framer-motion";
import type { OhengResult, Element } from "@/lib/saju/types";
import { colors } from "@/styles/theme";

const ELEMENT_INFO: Record<Element, { color: string; label: string }> = {
  "木": { color: colors.oheng["木"], label: "목(木)" },
  "火": { color: colors.oheng["火"], label: "화(火)" },
  "土": { color: colors.oheng["土"], label: "토(土)" },
  "金": { color: colors.oheng["金"], label: "금(金)" },
  "水": { color: colors.oheng["水"], label: "수(水)" },
};

interface OhengChartProps {
  oheng: OhengResult;
}

export function OhengChart({ oheng }: OhengChartProps) {
  const elements: Element[] = ["木", "火", "土", "金", "水"];
  const maxPercentage = Math.max(...elements.map((e) => oheng.distribution[e].percentage));

  return (
    <div className="bg-bg-elevated rounded-2xl p-4 sm:p-6 border border-border">
      <h3 className="text-sm font-bold text-text-primary mb-4">오행(五行) 분포</h3>

      <div className="space-y-3">
        {elements.map((element, i) => {
          const dist = oheng.distribution[element];
          const info = ELEMENT_INFO[element];
          const isStrongest = element === oheng.strongest;
          const isWeakest = element === oheng.weakest;
          const isMissing = oheng.missing.includes(element);

          return (
            <div key={element} className="flex items-center gap-3">
              <span
                className="text-xs font-bold w-12 text-right shrink-0"
                style={{ color: info.color }}
              >
                {info.label}
              </span>

              <div className="flex-1 h-6 bg-bg-sunken rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(dist.percentage / (maxPercentage || 1)) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: info.color, minWidth: dist.percentage > 0 ? "8px" : "0" }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/70">
                  {dist.percentage.toFixed(0)}%
                </span>
              </div>

              <span className="text-[10px] text-text-secondary w-8 shrink-0">
                {dist.count.toFixed(1)}
              </span>

              {isStrongest && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/20 text-success shrink-0">
                  최강
                </span>
              )}
              {isWeakest && !isMissing && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger/20 text-danger shrink-0">
                  최약
                </span>
              )}
              {isMissing && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger/20 text-danger shrink-0">
                  없음
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-secondary mt-4 text-center">
        {oheng.balance}
      </p>
    </div>
  );
}

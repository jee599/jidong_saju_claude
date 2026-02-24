"use client";

import { motion } from "framer-motion";
import type { ReportSection } from "@/lib/saju/types";

interface SectionCardProps {
  section: ReportSection;
  isLocked?: boolean;
  index?: number;
}

export function SectionCard({ section, isLocked, index = 0 }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      className="bg-bg-elevated rounded-2xl p-5 sm:p-6 border border-border relative overflow-hidden"
    >
      <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3">
        {section.title}
      </h3>

      {/* Keywords */}
      {section.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {section.keywords.map((kw, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-brand-muted text-brand-light"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className={`relative ${isLocked ? "max-h-24 overflow-hidden" : ""}`}>
        <p className="text-sm text-text-primary/85 leading-relaxed whitespace-pre-line">
          {section.text}
        </p>

        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-elevated/50 to-bg-elevated" />
        )}
      </div>

      {/* Highlights */}
      {!isLocked && section.highlights.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          {section.highlights.map((h, i) => (
            <p key={i} className="text-xs text-accent flex items-start gap-2 mt-1">
              <span className="shrink-0">&#9733;</span>
              {h}
            </p>
          ))}
        </div>
      )}

      {/* Paywall overlay */}
      {isLocked && (
        <div className="mt-2 text-center">
          <p className="text-xs text-text-secondary">
            전체 분석을 보려면 풀 리포트를 구매하세요
          </p>
        </div>
      )}
    </motion.div>
  );
}

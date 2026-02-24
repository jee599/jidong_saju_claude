"use client";

import { motion } from "framer-motion";
import type { ReportSection } from "@/lib/saju/types";
import { TermPopover } from "./TermPopover";

interface SectionCardProps {
  section: ReportSection;
  isLocked?: boolean;
  index?: number;
}

export function SectionCard({ section, isLocked, index = 0 }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-bg-elevated rounded-2xl p-5 sm:p-6 border border-border relative overflow-hidden shadow-elevation-1"
    >
      <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4">
        {section.title}
      </h3>

      {/* Keywords */}
      {section.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {section.keywords.map((kw, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full bg-brand-muted text-brand-light font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className={`relative ${isLocked ? "max-h-36 sm:max-h-40 overflow-hidden" : ""}`}>
        {isLocked ? (
          <p className="text-sm sm:text-base text-text-primary/85 leading-relaxed whitespace-pre-line">
            {section.text}
          </p>
        ) : (
          <TermPopover text={section.text} />
        )}

        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-elevated/30 to-bg-elevated" />
        )}
      </div>

      {/* Highlights */}
      {!isLocked && section.highlights.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          {section.highlights.map((h, i) => (
            <p key={i} className="text-xs text-accent flex items-start gap-2 mt-1.5">
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

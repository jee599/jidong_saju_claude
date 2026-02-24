"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { DaeunEntry } from "@/lib/saju/types";

interface DaeunTimelineProps {
  daeun: DaeunEntry[];
}

export function DaeunTimeline({ daeun }: DaeunTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-bg-elevated rounded-2xl p-4 sm:p-6 border border-border shadow-elevation-1">
      <h3 className="text-sm font-bold text-text-primary mb-4">대운(大運) 타임라인</h3>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {daeun.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`flex-shrink-0 w-28 sm:w-32 rounded-xl p-4 sm:p-5 text-center border transition-all ${
              entry.isCurrentDaeun
                ? "border-accent bg-accent-muted shadow-md shadow-accent/10"
                : "border-border bg-bg-sunken hover:border-brand/30"
            }`}
            style={{ scrollSnapAlign: "center" }}
          >
            <span className="text-xs sm:text-sm text-text-secondary block">
              {entry.startAge}세~
            </span>
            <span className={`font-hanja text-2xl sm:text-3xl font-bold block mt-1 ${
              entry.isCurrentDaeun ? "text-accent" : "text-text-primary"
            }`}>
              {entry.ganji}
            </span>
            <span className="text-xs text-text-secondary block mt-1">
              {entry.sipseong}
            </span>
            <span className="text-xs text-text-secondary block">
              {entry.unseong}
            </span>
            {entry.isCurrentDaeun && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                현재
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

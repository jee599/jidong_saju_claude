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
    <div className="bg-bg-elevated rounded-2xl p-4 sm:p-6 border border-border">
      <h3 className="text-sm font-bold text-text-primary mb-4">대운(大運) 타임라인</h3>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {daeun.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            className={`flex-shrink-0 w-20 sm:w-24 rounded-xl p-3 text-center border transition-all ${
              entry.isCurrentDaeun
                ? "border-accent bg-accent-muted shadow-md shadow-accent/10"
                : "border-border bg-bg-sunken hover:border-brand/30"
            }`}
            style={{ scrollSnapAlign: "center" }}
          >
            <span className="text-[10px] text-text-secondary block">
              {entry.startAge}세~
            </span>
            <span className={`font-hanja text-lg sm:text-xl font-bold block mt-1 ${
              entry.isCurrentDaeun ? "text-accent" : "text-text-primary"
            }`}>
              {entry.ganji}
            </span>
            <span className="text-[9px] text-text-secondary block mt-1">
              {entry.sipseong}
            </span>
            <span className="text-[9px] text-text-secondary block">
              {entry.unseong}
            </span>
            {entry.isCurrentDaeun && (
              <span className="inline-block text-[8px] mt-1 px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
                현재
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

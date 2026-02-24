"use client";

import { motion } from "framer-motion";
import type { Pillar } from "@/lib/saju/types";
import { colors } from "@/styles/theme";

interface PillarCardProps {
  pillar: Pillar;
  label: string;
  isDayMaster?: boolean;
  delay?: number;
  sipseong?: string;
  unseong?: string;
}

export function PillarCard({ pillar, label, isDayMaster, delay = 0, sipseong, unseong }: PillarCardProps) {
  const ganColor = colors.oheng[pillar.ganInfo.element] ?? colors.text.secondary;
  const jiColor = colors.oheng[pillar.jiInfo.element] ?? colors.text.secondary;

  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={`relative flex flex-col items-center p-3 sm:p-4 rounded-2xl border shadow-elevation-1 ${
        isDayMaster
          ? "border-accent/40 bg-gradient-to-b from-accent-muted to-transparent"
          : "border-border bg-bg-elevated"
      }`}
      style={{ perspective: "1000px" }}
    >
      {/* Label */}
      <span className={`text-[10px] sm:text-xs mb-2 font-medium ${isDayMaster ? "text-accent" : "text-text-secondary"}`}>
        {label}
        {isDayMaster && <span className="ml-1">(나)</span>}
      </span>

      {/* Cheongan (top) */}
      <div className="text-center mb-2">
        <span
          className="font-hanja text-2xl sm:text-3xl font-bold block"
          style={{ color: ganColor }}
        >
          {pillar.gan}
        </span>
        <span className="text-[10px] sm:text-xs text-text-secondary">
          {pillar.ganInfo.hangul}
        </span>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-border my-1" />

      {/* Jiji (bottom) */}
      <div className="text-center mt-2">
        <span
          className="font-hanja text-2xl sm:text-3xl font-bold block"
          style={{ color: jiColor }}
        >
          {pillar.ji}
        </span>
        <span className="text-[10px] sm:text-xs text-text-secondary">
          {pillar.jiInfo.hangul}({pillar.jiInfo.animal})
        </span>
      </div>

      {/* Sipseong + Unseong badges */}
      <div className="mt-3 flex flex-col items-center gap-1">
        {sipseong && (
          <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-brand-muted text-brand-light font-medium">
            {sipseong}
          </span>
        )}
        {unseong && (
          <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-secondary">
            {unseong}
          </span>
        )}
      </div>

      {/* Element badge */}
      <div
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-elevation-1"
        style={{ backgroundColor: ganColor }}
      >
        {pillar.ganInfo.element}
      </div>
    </motion.div>
  );
}

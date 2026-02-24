"use client";

import { useState, useRef, useEffect } from "react";
import { SAJU_TERMS } from "@/lib/saju/terms";

interface TermPopoverProps {
  text: string;
}

/**
 * 텍스트 내 명리 용어를 자동으로 탐지하여 밑줄+팝오버 적용.
 * 데스크톱: 호버, 모바일: 탭.
 */
export function TermPopover({ text }: TermPopoverProps) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const terms = Object.keys(SAJU_TERMS).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${terms.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "g");

  const showPopover = (term: string, e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.bottom - containerRect.top + 4,
      });
    }
    setActiveTerm(term);
  };

  const handleTermClick = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTerm(activeTerm === term ? null : term);
    if (activeTerm !== term) showPopover(term, e);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTerm(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const parts = text.split(pattern);

  return (
    <div ref={containerRef} className="relative">
      <p className="text-sm sm:text-base text-text-primary/85 leading-relaxed whitespace-pre-line">
        {parts.map((part, i) => {
          if (SAJU_TERMS[part]) {
            return (
              <span
                key={i}
                onClick={(e) => handleTermClick(part, e)}
                onMouseEnter={(e) => showPopover(part, e)}
                onMouseLeave={() => setActiveTerm(null)}
                className="underline decoration-dotted decoration-brand/50 underline-offset-2 cursor-help hover:text-brand-light transition-colors"
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>

      {activeTerm && SAJU_TERMS[activeTerm] && (
        <div
          className="absolute z-50 w-64 bg-bg-elevated border border-brand/20 rounded-xl p-3 shadow-elevation-3"
          style={{ left: `${position.x}px`, top: `${position.y}px`, transform: "translateX(-50%)" }}
        >
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-sm font-bold text-text-primary">{activeTerm}</span>
            <span className="font-hanja text-xs text-text-secondary">
              {SAJU_TERMS[activeTerm].hanja}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {SAJU_TERMS[activeTerm].description}
          </p>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-elevated border-l border-t border-brand/20 rotate-45" />
        </div>
      )}
    </div>
  );
}

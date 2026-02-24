// src/components/report/TermPopover.tsx — 명리 용어 해설 팝오버

"use client";

import { useState, useRef, useEffect } from "react";

// 명리학 용어 사전
const TERM_DICTIONARY: Record<string, { hanja: string; desc: string }> = {
  일간: { hanja: "日干", desc: "사주 중 일주의 천간. '나 자신'을 의미하는 핵심 글자" },
  십성: { hanja: "十星", desc: "일간을 기준으로 다른 글자와의 관계를 나타내는 10가지 별" },
  비견: { hanja: "比肩", desc: "나와 같은 오행, 같은 음양. 동료, 경쟁자, 독립심" },
  겁재: { hanja: "劫財", desc: "나와 같은 오행, 다른 음양. 도전, 변화, 과감함" },
  식신: { hanja: "食神", desc: "내가 생하는 오행, 같은 음양. 재능, 표현, 창의력" },
  상관: { hanja: "傷官", desc: "내가 생하는 오행, 다른 음양. 자유, 반항, 예술적 기질" },
  편재: { hanja: "偏財", desc: "내가 극하는 오행, 같은 음양. 투자, 사업, 활동적 재물" },
  정재: { hanja: "正財", desc: "내가 극하는 오행, 다른 음양. 안정적 수입, 저축, 근면" },
  편관: { hanja: "偏官", desc: "나를 극하는 오행, 같은 음양. 도전, 외부 압박, 칠살이라고도 함" },
  정관: { hanja: "正官", desc: "나를 극하는 오행, 다른 음양. 안정, 명예, 사회적 지위" },
  편인: { hanja: "偏印", desc: "나를 생하는 오행, 같은 음양. 학문, 비전통적 사고" },
  정인: { hanja: "正印", desc: "나를 생하는 오행, 다른 음양. 학업, 자격증, 어머니" },
  대운: { hanja: "大運", desc: "10년마다 바뀌는 인생의 큰 흐름. 월주를 기반으로 계산" },
  세운: { hanja: "歲運", desc: "해마다 바뀌는 1년 단위의 운세. 해당 연도의 간지" },
  용신: { hanja: "用神", desc: "사주에서 가장 필요한 오행. 이 오행을 보강하면 운이 좋아짐" },
  기신: { hanja: "忌神", desc: "사주에서 피해야 할 오행. 이 오행이 강해지면 불리" },
  희신: { hanja: "喜神", desc: "용신을 돕는 오행. 용신 다음으로 좋은 오행" },
  신강: { hanja: "身強", desc: "일간의 힘이 강한 상태. 비겁과 인성이 많음" },
  신약: { hanja: "身弱", desc: "일간의 힘이 약한 상태. 관성과 재성이 많음" },
  오행: { hanja: "五行", desc: "木(목)·火(화)·土(토)·金(금)·水(수) 다섯 가지 에너지" },
  천간: { hanja: "天干", desc: "甲乙丙丁戊己庚辛壬癸의 10가지. 하늘의 기운" },
  지지: { hanja: "地支", desc: "子丑寅卯辰巳午未申酉戌亥의 12가지. 땅의 기운(띠)" },
  지장간: { hanja: "地藏干", desc: "지지 속에 숨어있는 천간. 1~3개의 숨은 기운" },
  도화살: { hanja: "桃花煞", desc: "매력과 인기의 살. 이성에게 인기가 많음" },
  역마살: { hanja: "驛馬煞", desc: "이동과 변화의 살. 해외, 출장, 활동적인 삶" },
  화개살: { hanja: "華蓋煞", desc: "예술과 종교의 살. 학문적·예술적 감성" },
  천을귀인: { hanja: "天乙貴人", desc: "가장 강력한 귀인. 어려울 때 도움을 받는 힘" },
};

interface TermPopoverProps {
  text: string;
}

/**
 * 텍스트 내 명리 용어를 자동으로 탐지하여 밑줄+팝오버 적용
 */
export function TermPopover({ text }: TermPopoverProps) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 용어 패턴 생성 (긴 것부터 매칭)
  const terms = Object.keys(TERM_DICTIONARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${terms.join("|")})`, "g");

  const handleTermClick = (term: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.bottom - containerRect.top + 4,
      });
    }
    setActiveTerm(activeTerm === term ? null : term);
  };

  // 클릭 외부 감지
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTerm(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // 텍스트를 용어 기준으로 분할
  const parts = text.split(pattern);

  return (
    <div ref={containerRef} className="relative">
      <p className="text-sm text-text-primary/85 leading-relaxed">
        {parts.map((part, i) => {
          if (TERM_DICTIONARY[part]) {
            return (
              <span
                key={i}
                onClick={(e) => handleTermClick(part, e)}
                className="underline decoration-dotted decoration-brand/50 underline-offset-2 cursor-pointer hover:text-brand-light transition-colors"
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>

      {/* Popover */}
      {activeTerm && TERM_DICTIONARY[activeTerm] && (
        <div
          className="absolute z-50 w-64 bg-bg-elevated border border-brand/20 rounded-xl p-3 shadow-elevation-3"
          style={{ left: `${position.x}px`, top: `${position.y}px`, transform: "translateX(-50%)" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-hanja text-base text-accent">
              {TERM_DICTIONARY[activeTerm].hanja}
            </span>
            <span className="text-sm font-bold text-text-primary">{activeTerm}</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {TERM_DICTIONARY[activeTerm].desc}
          </p>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-elevated border-l border-t border-brand/30 rotate-45" />
        </div>
      )}
    </div>
  );
}

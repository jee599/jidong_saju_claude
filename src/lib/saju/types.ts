// src/lib/saju/types.ts — 만세력 엔진 타입 정의

export type Element = "木" | "火" | "土" | "金" | "水";
export type YinYang = "양" | "음";

export interface Cheongan {
  hanja: string;
  hangul: string;
  element: Element;
  yinYang: YinYang;
  nature: string;
  personality: string;
  number: number; // 0~9
}

export interface Jiji {
  hanja: string;
  hangul: string;
  animal: string;
  element: Element;
  yinYang: YinYang;
  hours: string;
  jijanggan: string[]; // 지장간 (숨은 천간들)
  number: number; // 0~11
}

export interface Pillar {
  gan: string; // 천간 한자
  ji: string; // 지지 한자
  ganInfo: Cheongan;
  jiInfo: Jiji;
}

export interface DayMaster {
  gan: string;
  element: Element;
  yinYang: YinYang;
  nature: string;
  isStrong: boolean;
  strengthReason: string;
}

export interface SipseongResult {
  distribution: Record<string, number>;
  dominant: string;
  missing: string[];
  details: Record<string, string>; // 각 위치별 십성
}

export interface UnseongResult {
  yearJi: string;
  monthJi: string;
  dayJi: string;
  hourJi: string;
  dominantStage: string;
}

export interface OhengDistribution {
  count: number;
  percentage: number;
}

export interface OhengResult {
  distribution: Record<Element, OhengDistribution>;
  strongest: Element;
  weakest: Element;
  missing: Element[];
  balance: string;
}

export interface YongsinResult {
  yongsin: Element;
  gisin: Element;
  heesin: Element;
  luckyColors: string[];
  luckyDirections: string[];
  luckyNumbers: number[];
}

export interface Interaction {
  type: string;
  elements: string[];
  description: string;
}

export interface Sinsal {
  name: string;
  type: "길신" | "흉신";
  location: string;
  meaning: string;
}

export interface DaeunEntry {
  startAge: number;
  ganji: string;
  period: string;
  sipseong: string;
  unseong: string;
  isCurrentDaeun: boolean;
}

export interface SeunResult {
  year: number;
  ganJi: string;
  element: Element;
  sipseong: string;
  keywords: string[];
}

export interface SajuInput {
  name?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
  isLeapMonth?: boolean;
}

export interface SajuResult {
  input: SajuInput;
  lunar: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  jeolgi: {
    name: string;
    date: string;
    isBeforeJeolgi: boolean;
  };
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  dayMaster: DayMaster;
  sipseong: SipseongResult;
  unseong: UnseongResult;
  oheng: OhengResult;
  yongsin: YongsinResult;
  interactions: {
    haps: Interaction[];
    chungs: Interaction[];
    hyeongs: Interaction[];
  };
  sinsals: Sinsal[];
  daeun: DaeunEntry[];
  seun: SeunResult;
  jijanggan: {
    yearJi: string[];
    monthJi: string[];
    dayJi: string[];
    hourJi: string[];
  };
}

// LLM 리포트 섹션
export interface ReportSection {
  title: string;
  text: string;
  keywords: string[];
  highlights: string[];
}

export type ReportSectionKey =
  | "personality"
  | "career"
  | "love"
  | "wealth"
  | "health"
  | "family"
  | "past"
  | "present"
  | "future"
  | "timeline";

export interface ReportResult {
  sections: Record<ReportSectionKey, ReportSection>;
  generatedAt: string;
  model: string;
}

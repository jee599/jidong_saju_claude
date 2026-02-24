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

export interface StrengthScoring {
  supportScore: number;
  drainScore: number;
  monthSupport: boolean;   // 월지 득령 여부
  dayJiSupport: boolean;   // 일지 근기 여부
  seasonElement: Element;  // 월지 본기 오행
  factors: string[];       // 점수 산출 근거 리스트
}

export interface DayMaster {
  gan: string;
  element: Element;
  yinYang: YinYang;
  nature: string;
  isStrong: boolean;
  strengthReason: string;
  strengthScoring: StrengthScoring;
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
  rationale: string;          // 용신 선정 이유
  method: "억부" | "조후" | "통관"; // 용신 선정 방법론
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
  element: Element | "";     // 대운 천간의 오행
  ganElement: Element | "";  // 천간 오행
  jiElement: Element | "";   // 지지 오행
}

export interface SeunResult {
  year: number;
  ganJi: string;
  element: Element;
  sipseong: string;
  keywords: string[];
  jiSipseong: string;           // 세운 지지의 십성
  natalInteractions: string[];  // 세운 지지와 사주 지지의 합충 관계
}

export interface SajuInput {
  name?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
  isLeapMonth?: boolean;
}

// 격국 (格局) — 월지 정기 기반 사주 구조 분류
export type GeokGukName =
  | "정관격" | "편관격"
  | "정인격" | "편인격"
  | "식신격" | "상관격"
  | "정재격" | "편재격"
  | "건록격" | "양인격";

export interface GeokGuk {
  name: GeokGukName;
  basis: string;        // 판별 근거 (예: "월지 寅의 정기 甲 → 비견이나 건록격")
  monthMainGan: string; // 월지 정기 천간
  monthMainSipseong: string; // 월지 정기의 십성
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
  geokguk: GeokGuk;
  interactions: {
    haps: Interaction[];
    chungs: Interaction[];
    hyeongs: Interaction[];
    pas: Interaction[];          // 파(破)
    haes: Interaction[];         // 해(害)
    cheonganHaps: Interaction[]; // 천간합
    cheonganChungs: Interaction[]; // 천간충
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

export type ReportTier = "free" | "premium";

export const FREE_SECTION_KEYS: ReportSectionKey[] = [
  "personality",
  "career",
  "love",
  "present",
];

export const ALL_SECTION_KEYS: ReportSectionKey[] = [
  "personality",
  "career",
  "love",
  "wealth",
  "health",
  "family",
  "past",
  "present",
  "future",
  "timeline",
];

export interface UsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostUsd: number;
}

export interface ReportResult {
  sections: Record<string, ReportSection>;
  generatedAt: string;
  model: string;
  tier: ReportTier;
  usage?: UsageStats;
}

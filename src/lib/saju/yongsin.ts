// src/lib/saju/yongsin.ts — 용신/기신 추론

import type { Element, YongsinResult, OhengResult, Pillar, StrengthScoring } from "./types";
import {
  OHENG_CYCLE,
  getCheonganByHanja,
  getJijiByHanja,
  JIJI_LIST,
} from "./constants";

// 오행별 럭키 색상
const ELEMENT_COLORS: Record<Element, string[]> = {
  木: ["초록", "연두", "청록"],
  火: ["빨강", "보라", "주황"],
  土: ["노랑", "갈색", "베이지"],
  金: ["흰색", "은색", "금색"],
  水: ["검정", "파랑", "남색"],
};

// 오행별 방위
const ELEMENT_DIRECTIONS: Record<Element, string[]> = {
  木: ["동쪽"],
  火: ["남쪽"],
  土: ["중앙"],
  金: ["서쪽"],
  水: ["북쪽"],
};

// 오행별 숫자
const ELEMENT_NUMBERS: Record<Element, number[]> = {
  木: [3, 8],
  火: [2, 7],
  土: [5, 10],
  金: [4, 9],
  水: [1, 6],
};

/**
 * 일간 강약 판단
 *
 * 일간이 강한지 약한지를 판단하여 용신을 결정
 *
 * 강한 경우: 일간과 같은 오행/인성이 많음 → 설기(식상/재성/관성) 필요
 * 약한 경우: 관성/재성이 많음 → 보기(비겁/인성) 필요
 */
export function isDayMasterStrong(
  dayGan: string,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  monthJi: string
): { isStrong: boolean; reason: string; scoring: StrengthScoring } {
  const dayInfo = getCheonganByHanja(dayGan);
  if (!dayInfo) throw new Error(`Unknown dayGan: ${dayGan}`);

  const dayElement = dayInfo.element;
  const cycle = OHENG_CYCLE[dayElement];
  const factors: string[] = [];

  let supportScore = 0; // 일간을 돕는 점수 (비겁 + 인성)
  let drainScore = 0; // 일간을 빼는 점수 (식상 + 재성 + 관성)

  // 천간 3개(일간 제외) 검사
  const otherGans = [
    { gan: pillars.year.gan, pos: "년간" },
    { gan: pillars.month.gan, pos: "월간" },
    { gan: pillars.hour.gan, pos: "시간" },
  ];
  for (const { gan, pos } of otherGans) {
    const info = getCheonganByHanja(gan);
    if (!info) continue;
    if (info.element === dayElement || info.element === cycle.generatedBy) {
      supportScore += 1;
      factors.push(`${pos} ${gan}(${info.element}) → 도움 +1`);
    } else {
      drainScore += 1;
      factors.push(`${pos} ${gan}(${info.element}) → 소모 +1`);
    }
  }

  // 지지 4개 검사 (지지의 본기 오행)
  const allJi = [
    { ji: pillars.year.ji, pos: "년지" },
    { ji: pillars.month.ji, pos: "월지" },
    { ji: pillars.day.ji, pos: "일지" },
    { ji: pillars.hour.ji, pos: "시지" },
  ];
  for (const { ji, pos } of allJi) {
    const info = getJijiByHanja(ji);
    if (!info) continue;
    if (info.element === dayElement || info.element === cycle.generatedBy) {
      supportScore += 1;
      factors.push(`${pos} ${ji}(${info.element}) → 도움 +1`);
    } else {
      drainScore += 1;
      factors.push(`${pos} ${ji}(${info.element}) → 소모 +1`);
    }
  }

  // 월지 득령 여부 (매우 중요)
  const monthJiInfo = getJijiByHanja(monthJi);
  const monthElement = monthJiInfo?.element ?? "土";
  const isMonthSupport = monthElement === dayElement || monthElement === cycle.generatedBy;
  if (isMonthSupport) {
    supportScore += 2; // 월지 득령은 가중치 높음
    factors.push(`월지 득령(得令) 가중 +2`);
  } else {
    factors.push(`월지 실령(失令)`);
  }

  // 일지 근기 여부
  const dayJiInfo = getJijiByHanja(pillars.day.ji);
  const dayJiElement = dayJiInfo?.element;
  const isDayJiSupport = dayJiElement === dayElement || dayJiElement === cycle.generatedBy;
  if (isDayJiSupport) {
    supportScore += 1; // 일지 뿌리도 중요
    factors.push(`일지 근기(根基) 가중 +1`);
  }

  const isStrong = supportScore > drainScore;

  const reasons: string[] = [];
  if (isMonthSupport) {
    reasons.push(`월지 ${monthJi}에서 득령(得令)`);
  } else {
    reasons.push(`월지 ${monthJi}에서 실령(失令)`);
  }

  if (isDayJiSupport) {
    reasons.push(`일지 ${pillars.day.ji}에서 근기(根基) 있음`);
  }

  reasons.push(`도움(${supportScore}점) vs 소모(${drainScore}점)`);

  const scoring: StrengthScoring = {
    supportScore,
    drainScore,
    monthSupport: isMonthSupport,
    dayJiSupport: isDayJiSupport,
    seasonElement: monthElement as Element,
    factors,
  };

  return {
    isStrong,
    reason: isStrong
      ? `신강(身強): ${reasons.join(", ")}`
      : `신약(身弱): ${reasons.join(", ")}`,
    scoring,
  };
}

// ─── 조후용신 (季節 조절) ───
// 여름(巳午未) 태어난 사주는 水가 조후용신, 겨울(亥子丑) 태어난 사주는 火가 조후용신
const JOHU_YONGSIN: Record<string, Element | null> = {
  寅: null, 卯: null, 辰: null,   // 봄 — 조후 불필요
  巳: "水", 午: "水", 未: "水",   // 여름 — 수(水)로 조후
  申: null, 酉: null, 戌: null,   // 가을 — 조후 불필요
  亥: "火", 子: "火", 丑: "火",   // 겨울 — 화(火)로 조후
};

/**
 * 통관용신 판별
 *
 * 사주에 두 오행이 극(剋) 관계로 팽팽하게 대립할 때,
 * 두 오행 사이를 이어주는(통관) 오행이 용신이 됨.
 * 예: 金↔木 대립 시 → 水가 통관 (金→水→木)
 */
function findTongGwanYongsin(oheng: OhengResult): Element | null {
  const elements: Element[] = ["木", "火", "土", "金", "水"];
  const counts = oheng.distribution;

  // 상위 2개 오행이 상극 관계이고 둘 다 강할 때
  const sorted = elements.slice().sort((a, b) => (counts[b]?.count || 0) - (counts[a]?.count || 0));
  const top1 = sorted[0];
  const top2 = sorted[1];

  if ((counts[top1]?.count || 0) < 2 || (counts[top2]?.count || 0) < 2) return null;

  const cycle1 = OHENG_CYCLE[top1];
  const cycle2 = OHENG_CYCLE[top2];

  // top1이 top2를 극하면: top1 → 통관 → top2 (top1이 생하는 오행 = 통관)
  if (cycle1.controls === top2) {
    return cycle1.generates; // top1이 생하는 것이 둘을 연결
  }
  // top2가 top1을 극하면
  if (cycle2.controls === top1) {
    return cycle2.generates;
  }

  return null;
}

/**
 * 용신/기신/희신 결정
 *
 * 방법론 우선순위:
 * 1. 통관용신: 두 강한 오행이 대립 시
 * 2. 조후용신: 여름/겨울 극단적 계절 시
 * 3. 억부용신: 기본 — 신강이면 설기, 신약이면 보기
 */
export function calculateYongsin(
  dayGan: string,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  oheng: OhengResult
): YongsinResult {
  const dayInfo = getCheonganByHanja(dayGan);
  if (!dayInfo) throw new Error(`Unknown dayGan: ${dayGan}`);

  const dayElement = dayInfo.element;
  const cycle = OHENG_CYCLE[dayElement];
  const { isStrong } = isDayMasterStrong(dayGan, pillars, pillars.month.ji);
  const monthJi = pillars.month.ji;

  let yongsin: Element;
  let gisin: Element;
  let heesin: Element;
  let rationale: string;
  let method: "억부" | "조후" | "통관" = "억부";

  // ── [1] 통관용신 체크 ──
  const tongGwan = findTongGwanYongsin(oheng);
  if (tongGwan) {
    yongsin = tongGwan;
    method = "통관";
    gisin = OHENG_CYCLE[yongsin].controlledBy;
    heesin = OHENG_CYCLE[yongsin].generatedBy;
    rationale = `사주 내 강한 오행 간 상극 대립 → 통관용신으로 ${yongsin}(${OHENG_CYCLE[yongsin].generates}을 생함) 선정`;
  }
  // ── [2] 조후용신 체크 ──
  else if (JOHU_YONGSIN[monthJi] && (oheng.distribution[JOHU_YONGSIN[monthJi]!]?.count || 0) < 1.5) {
    const johu = JOHU_YONGSIN[monthJi]!;
    yongsin = johu;
    method = "조후";
    gisin = OHENG_CYCLE[yongsin].controlledBy;
    heesin = OHENG_CYCLE[yongsin].generatedBy;
    const season = monthJi === "巳" || monthJi === "午" || monthJi === "未" ? "여름" : "겨울";
    rationale = `월지 ${monthJi} (${season}) → 조후용신으로 ${yongsin} 선정 (사주 내 ${yongsin} 부족)`;
  }
  // ── [3] 억부용신 (기본 로직) ──
  else if (isStrong) {
    method = "억부";
    const drainElements: Element[] = [
      cycle.generates,    // 식상 (내가 생하는)
      cycle.controls,     // 재성 (내가 극하는)
    ];

    yongsin = drainElements.reduce((a, b) =>
      (oheng.distribution[a]?.count || 0) <= (oheng.distribution[b]?.count || 0) ? a : b
    );

    gisin = cycle.generatedBy; // 인성
    heesin = OHENG_CYCLE[yongsin].generatedBy;
    rationale = `신강(身強) → 억부용신: 일간 ${dayGan}(${dayElement})의 힘을 빼는 ${yongsin} 선정 (식상/재성 중 가장 부족)`;
  } else {
    method = "억부";
    const supportElements: Element[] = [
      cycle.generatedBy,  // 인성 (나를 생하는)
      dayElement,         // 비겁 (같은 오행)
    ];

    yongsin = supportElements.reduce((a, b) =>
      (oheng.distribution[a]?.count || 0) <= (oheng.distribution[b]?.count || 0) ? a : b
    );

    gisin = cycle.generates; // 식상
    heesin = OHENG_CYCLE[yongsin].generatedBy;
    rationale = `신약(身弱) → 억부용신: 일간 ${dayGan}(${dayElement})의 힘을 보태는 ${yongsin} 선정 (인성/비겁 중 가장 부족)`;
  }

  return {
    yongsin,
    gisin,
    heesin,
    luckyColors: ELEMENT_COLORS[yongsin],
    luckyDirections: ELEMENT_DIRECTIONS[yongsin],
    luckyNumbers: ELEMENT_NUMBERS[yongsin],
    rationale,
    method,
  };
}

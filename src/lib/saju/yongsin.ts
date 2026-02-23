// src/lib/saju/yongsin.ts — 용신/기신 추론

import type { Element, YongsinResult, OhengResult, Pillar } from "./types";
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
): { isStrong: boolean; reason: string } {
  const dayInfo = getCheonganByHanja(dayGan);
  if (!dayInfo) throw new Error(`Unknown dayGan: ${dayGan}`);

  const dayElement = dayInfo.element;
  const cycle = OHENG_CYCLE[dayElement];

  let supportScore = 0; // 일간을 돕는 점수 (비겁 + 인성)
  let drainScore = 0; // 일간을 빼는 점수 (식상 + 재성 + 관성)

  // 천간 3개(일간 제외) 검사
  const otherGans = [pillars.year.gan, pillars.month.gan, pillars.hour.gan];
  for (const gan of otherGans) {
    const info = getCheonganByHanja(gan);
    if (!info) continue;
    if (info.element === dayElement || info.element === cycle.generatedBy) {
      supportScore += 1;
    } else {
      drainScore += 1;
    }
  }

  // 지지 4개 검사 (지지의 본기 오행)
  const allJi = [pillars.year.ji, pillars.month.ji, pillars.day.ji, pillars.hour.ji];
  for (const ji of allJi) {
    const info = getJijiByHanja(ji);
    if (!info) continue;
    if (info.element === dayElement || info.element === cycle.generatedBy) {
      supportScore += 1;
    } else {
      drainScore += 1;
    }
  }

  // 월지 득령 여부 (매우 중요)
  const monthJiInfo = getJijiByHanja(monthJi);
  const monthElement = monthJiInfo?.element;
  const isMonthSupport = monthElement === dayElement || monthElement === cycle.generatedBy;
  if (isMonthSupport) {
    supportScore += 2; // 월지 득령은 가중치 높음
  }

  // 일지 근기 여부
  const dayJiInfo = getJijiByHanja(pillars.day.ji);
  const dayJiElement = dayJiInfo?.element;
  const isDayJiSupport = dayJiElement === dayElement || dayJiElement === cycle.generatedBy;
  if (isDayJiSupport) {
    supportScore += 1; // 일지 뿌리도 중요
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

  return {
    isStrong,
    reason: isStrong
      ? `신강(身強): ${reasons.join(", ")}`
      : `신약(身弱): ${reasons.join(", ")}`,
  };
}

/**
 * 용신/기신/희신 결정
 *
 * 신강 → 용신: 식상 > 재성 > 관성 (설기/극기)
 * 신약 → 용신: 인성 > 비겁 (생기/부기)
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

  let yongsin: Element;
  let gisin: Element;
  let heesin: Element;

  if (isStrong) {
    // 신강: 일간의 힘을 빼야 함
    // 우선순위: 가장 부족한 오행 중 식상/재성/관성
    const drainElements: Element[] = [
      cycle.generates,    // 식상 (내가 생하는)
      cycle.controls,     // 재성 (내가 극하는)
    ];

    // 가장 약한 것을 용신으로
    yongsin = drainElements.reduce((a, b) =>
      (oheng.distribution[a]?.count || 0) <= (oheng.distribution[b]?.count || 0) ? a : b
    );

    // 기신: 일간을 돕는 오행 (비겁/인성)
    gisin = cycle.generatedBy; // 인성

    // 희신: 용신을 생하는 오행
    heesin = OHENG_CYCLE[yongsin].generatedBy;
  } else {
    // 신약: 일간의 힘을 보태야 함
    // 우선순위: 인성 > 비겁
    const supportElements: Element[] = [
      cycle.generatedBy,  // 인성 (나를 생하는)
      dayElement,         // 비겁 (같은 오행)
    ];

    yongsin = supportElements.reduce((a, b) =>
      (oheng.distribution[a]?.count || 0) <= (oheng.distribution[b]?.count || 0) ? a : b
    );

    // 기신: 일간을 빼는 오행
    gisin = cycle.generates; // 식상

    // 희신: 용신을 생하는 오행
    heesin = OHENG_CYCLE[yongsin].generatedBy;
  }

  return {
    yongsin,
    gisin,
    heesin,
    luckyColors: ELEMENT_COLORS[yongsin],
    luckyDirections: ELEMENT_DIRECTIONS[yongsin],
    luckyNumbers: ELEMENT_NUMBERS[yongsin],
  };
}

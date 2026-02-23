// src/lib/saju/sipseong.ts — 십성 판별

import type { Element, YinYang, SipseongResult, Pillar } from "./types";
import {
  CHEONGAN_LIST,
  JIJI_LIST,
  OHENG_CYCLE,
  getCheonganByHanja,
  getJijiByHanja,
} from "./constants";

type SipseongName =
  | "비견" | "겁재"
  | "식신" | "상관"
  | "편재" | "정재"
  | "편관" | "정관"
  | "편인" | "정인";

/**
 * 일간과 대상 천간의 관계로 십성 판별
 *
 * 같은 오행:
 *   같은 음양 → 비견  |  다른 음양 → 겁재
 * 내가 생(生)하는 오행:
 *   같은 음양 → 식신  |  다른 음양 → 상관
 * 내가 극(克)하는 오행:
 *   같은 음양 → 편재  |  다른 음양 → 정재
 * 나를 극하는 오행:
 *   같은 음양 → 편관  |  다른 음양 → 정관
 * 나를 생하는 오행:
 *   같은 음양 → 편인  |  다른 음양 → 정인
 */
export function getSipseong(dayGan: string, targetGan: string): SipseongName {
  const day = getCheonganByHanja(dayGan);
  const target = getCheonganByHanja(targetGan);
  if (!day || !target) throw new Error(`Unknown cheongan: ${dayGan} or ${targetGan}`);

  const dayEl = day.element;
  const targetEl = target.element;
  const sameYinYang = day.yinYang === target.yinYang;

  // 같은 오행
  if (dayEl === targetEl) {
    return sameYinYang ? "비견" : "겁재";
  }

  const cycle = OHENG_CYCLE[dayEl];

  // 내가 생하는 오행 (식상)
  if (cycle.generates === targetEl) {
    return sameYinYang ? "식신" : "상관";
  }

  // 내가 극하는 오행 (재성)
  if (cycle.controls === targetEl) {
    return sameYinYang ? "편재" : "정재";
  }

  // 나를 극하는 오행 (관성)
  if (cycle.controlledBy === targetEl) {
    return sameYinYang ? "편관" : "정관";
  }

  // 나를 생하는 오행 (인성)
  if (cycle.generatedBy === targetEl) {
    return sameYinYang ? "편인" : "정인";
  }

  throw new Error(`Cannot determine sipseong: ${dayGan} → ${targetGan}`);
}

/**
 * 일간과 대상 지지의 본기(정기) 기준 십성
 */
export function getSipseongForJiji(dayGan: string, targetJi: string): SipseongName {
  const jiInfo = getJijiByHanja(targetJi);
  if (!jiInfo) throw new Error(`Unknown jiji: ${targetJi}`);

  // 지지의 본기(첫 번째 지장간)를 기준으로 십성 판별
  const mainGan = jiInfo.jijanggan[0];
  return getSipseong(dayGan, mainGan);
}

/**
 * 지장간 각각의 십성을 모두 반환
 */
export function getJijangganSipseong(dayGan: string, jijanggan: string[]): SipseongName[] {
  return jijanggan.map((gan) => getSipseong(dayGan, gan));
}

/**
 * 사주 전체의 십성을 계산하여 SipseongResult 반환
 */
export function calculateSipseong(
  dayGan: string,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  jijanggan: { yearJi: string[]; monthJi: string[]; dayJi: string[]; hourJi: string[] }
): SipseongResult {
  const details: Record<string, string> = {};
  const distribution: Record<string, number> = {};

  // 천간 4개의 십성 (일간 자신은 "일주")
  const ganPositions = [
    { key: "yearGan", gan: pillars.year.gan },
    { key: "monthGan", gan: pillars.month.gan },
    { key: "dayGan", gan: pillars.day.gan },
    { key: "hourGan", gan: pillars.hour.gan },
  ];

  for (const { key, gan } of ganPositions) {
    if (key === "dayGan") {
      details[key] = "일주";
      continue;
    }
    const ss = getSipseong(dayGan, gan);
    details[key] = ss;
    distribution[ss] = (distribution[ss] || 0) + 1;
  }

  // 지지 4개의 본기 십성
  const jiPositions = [
    { key: "yearJi", ji: pillars.year.ji },
    { key: "monthJi", ji: pillars.month.ji },
    { key: "dayJi", ji: pillars.day.ji },
    { key: "hourJi", ji: pillars.hour.ji },
  ];

  for (const { key, ji } of jiPositions) {
    const ss = getSipseongForJiji(dayGan, ji);
    details[key] = ss;
    distribution[ss] = (distribution[ss] || 0) + 1;
  }

  // 지장간 전체 십성
  const allJijanggan = [
    ...jijanggan.yearJi,
    ...jijanggan.monthJi,
    ...jijanggan.dayJi,
    ...jijanggan.hourJi,
  ];

  for (const gan of allJijanggan) {
    const ss = getSipseong(dayGan, gan);
    distribution[ss] = (distribution[ss] || 0) + 1;
  }

  // dominant: 가장 많은 십성
  const allSipseong = [
    "비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인",
  ];
  const dominant = allSipseong.reduce((a, b) =>
    (distribution[a] || 0) >= (distribution[b] || 0) ? a : b
  );
  const missing = allSipseong.filter((s) => !distribution[s]);

  return { distribution, dominant, missing, details };
}

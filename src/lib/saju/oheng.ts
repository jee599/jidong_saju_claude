// src/lib/saju/oheng.ts — 오행 분포 + 상생상극

import type { Element, OhengResult, Pillar } from "./types";
import { getCheonganByHanja, getJijiByHanja } from "./constants";

/**
 * 사주 전체의 오행 분포를 계산
 *
 * 천간 4개 + 지지 4개의 본기(정기) + 지장간 전체를 합산
 * 천간/지지 본기는 가중치 1.0, 지장간 중기는 0.6, 여기는 0.3
 */
export function calculateOheng(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  jijanggan: { yearJi: string[]; monthJi: string[]; dayJi: string[]; hourJi: string[] }
): OhengResult {
  const counts: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  // 천간 4개 (가중치 1.0)
  const gans = [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
  for (const gan of gans) {
    const info = getCheonganByHanja(gan);
    if (info) counts[info.element] += 1;
  }

  // 지지 4개 (본기, 가중치 1.0)
  const jis = [pillars.year.ji, pillars.month.ji, pillars.day.ji, pillars.hour.ji];
  for (const ji of jis) {
    const info = getJijiByHanja(ji);
    if (info) counts[info.element] += 1;
  }

  // 지장간 (가중치: 본기 0.6, 중기 0.3, 여기 0.2)
  const jijangganArrays = [jijanggan.yearJi, jijanggan.monthJi, jijanggan.dayJi, jijanggan.hourJi];
  for (const jjg of jijangganArrays) {
    for (let i = 0; i < jjg.length; i++) {
      const ganInfo = getCheonganByHanja(jjg[i]);
      if (ganInfo) {
        // 본기(첫번째): 0.6, 중기(두번째): 0.3, 여기(세번째): 0.2
        const weight = i === 0 ? 0.6 : i === 1 ? 0.3 : 0.2;
        counts[ganInfo.element] += weight;
      }
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const distribution = {} as Record<Element, { count: number; percentage: number }>;
  const elements: Element[] = ["木", "火", "土", "金", "水"];

  for (const el of elements) {
    distribution[el] = {
      count: Math.round(counts[el] * 10) / 10,
      percentage: total > 0 ? Math.round((counts[el] / total) * 1000) / 10 : 0,
    };
  }

  // 가장 강한/약한 오행
  const sorted = elements.slice().sort((a, b) => counts[b] - counts[a]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // 없는 오행 (천간+지지 본기 기준, 가중치 제외한 순수 개수가 0인 경우)
  const pureCounts: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const gan of gans) {
    const info = getCheonganByHanja(gan);
    if (info) pureCounts[info.element]++;
  }
  for (const ji of jis) {
    const info = getJijiByHanja(ji);
    if (info) pureCounts[info.element]++;
  }
  const missing = elements.filter((el) => pureCounts[el] === 0);

  // 균형 판단
  const maxPercent = distribution[strongest].percentage;
  const minPercent = distribution[weakest].percentage;
  let balance: string;
  if (maxPercent - minPercent <= 10) {
    balance = "균형";
  } else if (maxPercent >= 35) {
    balance = `${strongest} 과다`;
  } else if (missing.length > 0) {
    balance = `${missing.join(",")} 부족`;
  } else {
    balance = `${strongest} 강세, ${weakest} 약세`;
  }

  return { distribution, strongest, weakest, missing, balance };
}

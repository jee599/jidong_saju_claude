// src/lib/saju/unseong.ts — 12운성 판별

import type { UnseongResult } from "./types";
import { UNSEONG_TABLE, JIJI_LIST } from "./constants";

/**
 * 일간(日干)과 지지(地支)로 12운성을 조회
 *
 * 12운성: 장생→목욕→관대→건록→제왕→쇠→병→사→묘→절→태→양
 * 일간의 에너지가 각 지지에서 어떤 단계에 있는지를 나타냄
 */
export function getUnseong(dayGan: string, targetJi: string): string {
  const table = UNSEONG_TABLE[dayGan];
  if (!table) throw new Error(`Unknown dayGan for unseong: ${dayGan}`);

  const jiInfo = JIJI_LIST.find((j) => j.hanja === targetJi);
  if (!jiInfo) throw new Error(`Unknown jiji for unseong: ${targetJi}`);

  return table[jiInfo.number];
}

/**
 * 사주 4기둥의 지지별 12운성을 모두 계산
 */
export function calculateUnseong(
  dayGan: string,
  yearJi: string,
  monthJi: string,
  dayJi: string,
  hourJi: string
): UnseongResult {
  const yearUnseong = getUnseong(dayGan, yearJi);
  const monthUnseong = getUnseong(dayGan, monthJi);
  const dayUnseong = getUnseong(dayGan, dayJi);
  const hourUnseong = getUnseong(dayGan, hourJi);

  // 가장 강한(에너지 높은) 운성 판별
  // 에너지 순서: 제왕 > 건록 > 관대 > 장생 > 목욕 > 양 > 태 > 쇠 > 병 > 사 > 묘 > 절
  const energyRank: Record<string, number> = {
    제왕: 12, 건록: 11, 관대: 10, 장생: 9, 목욕: 8,
    양: 7, 태: 6, 쇠: 5, 병: 4, 사: 3, 묘: 2, 절: 1,
  };

  const all = [
    { name: yearUnseong, rank: energyRank[yearUnseong] || 0 },
    { name: monthUnseong, rank: energyRank[monthUnseong] || 0 },
    { name: dayUnseong, rank: energyRank[dayUnseong] || 0 },
    { name: hourUnseong, rank: energyRank[hourUnseong] || 0 },
  ];

  const dominantStage = all.reduce((a, b) => (a.rank >= b.rank ? a : b)).name;

  return {
    yearJi: yearUnseong,
    monthJi: monthUnseong,
    dayJi: dayUnseong,
    hourJi: hourUnseong,
    dominantStage,
  };
}

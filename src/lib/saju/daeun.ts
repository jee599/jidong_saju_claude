// src/lib/saju/daeun.ts — 대운 계산

import type { DaeunEntry, SeunResult, Element } from "./types";
import { getCalendarInfo, getYun } from "./calendar";
import { getSipseong } from "./sipseong";
import { getUnseong } from "./unseong";
import {
  CHEONGAN_LIST,
  JIJI_LIST,
  getCheonganByHanja,
  getCheonganElement,
} from "./constants";

/**
 * 대운 계산
 *
 * 대운은 성별 + 연간 음양에 따라 순행/역행이 결정됨
 * - 남자+양간 또는 여자+음간 → 순행
 * - 남자+음간 또는 여자+양간 → 역행
 *
 * lunar-javascript의 Yun 클래스를 활용하여 대운 시퀀스 생성
 */
export function calculateDaeun(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  birthMinute: number,
  gender: "male" | "female",
  dayGan: string,
  calendarType: "solar" | "lunar" = "solar",
  isLeapMonth: boolean = false,
  currentYear: number = 2026
): DaeunEntry[] {
  const yun = getYun(
    birthYear,
    birthMonth,
    birthDay,
    birthHour,
    birthMinute,
    gender,
    calendarType,
    isLeapMonth
  );

  const daYunList = yun.getDaYun();
  const entries: DaeunEntry[] = [];

  for (let i = 0; i < daYunList.length && i < 12; i++) {
    const daYun = daYunList[i];
    const ganJi = daYun.getGanZhi();
    const startAge = daYun.getStartAge();
    const startYear = daYun.getStartYear();
    const endYear = startYear + 9;

    // 간지에서 천간과 지지 분리
    const gan = ganJi.charAt(0);
    const ji = ganJi.charAt(1);

    // 십성 계산 (대운 천간 기준)
    let sipseong = "";
    try {
      sipseong = i === 0 ? "" : getSipseong(dayGan, gan);
    } catch {
      sipseong = "";
    }

    // 12운성 계산
    let unseong = "";
    try {
      unseong = i === 0 ? "" : getUnseong(dayGan, ji);
    } catch {
      unseong = "";
    }

    // 현재 대운 여부
    const isCurrentDaeun = currentYear >= startYear && currentYear <= endYear;

    entries.push({
      startAge,
      ganji: ganJi,
      period: `${startYear}~${endYear}`,
      sipseong,
      unseong,
      isCurrentDaeun,
    });
  }

  return entries;
}

/**
 * 세운(歲運) 계산 — 특정 연도의 간지와 사주 상호작용
 */
export function calculateSeun(
  year: number,
  dayGan: string
): SeunResult {
  // 연도의 간지 계산 (갑자 순환)
  const ganIndex = (year - 4) % 10;
  const jiIndex = (year - 4) % 12;

  const gan = CHEONGAN_LIST[ganIndex].hanja;
  const ji = JIJI_LIST[jiIndex].hanja;
  const ganJi = `${gan}${ji}`;

  // 세운 천간의 오행
  const element = getCheonganElement(gan);

  // 세운 천간과 일간의 십성 관계
  const sipseong = getSipseong(dayGan, gan);

  // 세운 키워드 생성
  const keywords = generateSeunKeywords(sipseong, element, dayGan);

  return {
    year,
    ganJi,
    element,
    sipseong,
    keywords,
  };
}

/**
 * 세운 키워드 생성
 */
function generateSeunKeywords(sipseong: string, element: Element, dayGan: string): string[] {
  const keywordMap: Record<string, string[]> = {
    비견: ["경쟁", "독립", "동료", "자아 확장"],
    겁재: ["도전", "변화", "과감한 행동", "재물 변동"],
    식신: ["창의력", "즐거움", "표현", "먹거리"],
    상관: ["자유", "반항", "예술", "변화 추구"],
    편재: ["투자", "사업 확장", "새로운 수입원", "활동적 재물"],
    정재: ["안정적 수입", "저축", "근면", "꾸준한 성장"],
    편관: ["변화", "도전", "외부 압박", "승부"],
    정관: ["승진", "안정", "책임감", "사회적 인정"],
    편인: ["학습", "변화", "새로운 관심사", "영감"],
    정인: ["학업", "자격증", "지원", "어머니의 영향"],
  };

  return keywordMap[sipseong] || ["변화", "새로운 시작"];
}

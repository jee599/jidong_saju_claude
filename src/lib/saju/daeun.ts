// src/lib/saju/daeun.ts — 대운 계산

import type { DaeunEntry, SeunResult, Element } from "./types";
import { getYun } from "./calendar";
import { getSipseong, getSipseongForJiji } from "./sipseong";
import { getUnseong } from "./unseong";
import {
  CHEONGAN_LIST,
  JIJI_LIST,
  getCheonganByHanja,
  getCheonganElement,
  getJijiByHanja,
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

    // 초운(初運, i=0)은 ganji가 비어있을 수 있음 → 건너뛰기
    if (!ganJi || ganJi.length < 2) continue;

    const startAge = daYun.getStartAge();
    const startYear = daYun.getStartYear();
    const endYear = startYear + 9;

    // 간지에서 천간과 지지 분리
    const gan = ganJi.charAt(0);
    const ji = ganJi.charAt(1);

    // 십성 계산 (대운 천간 기준)
    let sipseong = "";
    try {
      sipseong = getSipseong(dayGan, gan);
    } catch {
      sipseong = "";
    }

    // 12운성 계산
    let unseong = "";
    try {
      unseong = getUnseong(dayGan, ji);
    } catch {
      unseong = "";
    }

    // 대운 천간/지지 오행
    let ganElement: Element | "" = "";
    let jiElement: Element | "" = "";
    try {
      const ganInfo = getCheonganByHanja(gan);
      if (ganInfo) ganElement = ganInfo.element;
      const jiInfo = getJijiByHanja(ji);
      if (jiInfo) jiElement = jiInfo.element;
    } catch {
      // skip
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
      element: ganElement,
      ganElement,
      jiElement,
    });
  }

  return entries;
}

/**
 * 세운(歲運) 계산 — 특정 연도의 간지와 사주 상호작용
 *
 * @param natalJiList - 사주 4기둥 지지 배열 (세운 지지와의 합충 분석용)
 */
export function calculateSeun(
  year: number,
  dayGan: string,
  natalJiList?: string[]
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

  // 세운 지지와 일간의 십성 관계
  const jiSipseong = getSipseongForJiji(dayGan, ji);

  // 세운 지지와 사주 지지의 합충 분석
  const natalInteractions: string[] = [];
  if (natalJiList) {
    // 육합/충 조견표
    const YUKHAP_MAP: Record<string, string> = {
      "子丑": "토합", "丑子": "토합", "寅亥": "목합", "亥寅": "목합",
      "卯戌": "화합", "戌卯": "화합", "辰酉": "금합", "酉辰": "금합",
      "巳申": "수합", "申巳": "수합", "午未": "토합", "未午": "토합",
    };
    const CHUNG_MAP: Record<string, string> = {
      "子午": "자오충", "午子": "자오충", "丑未": "축미충", "未丑": "축미충",
      "寅申": "인신충", "申寅": "인신충", "卯酉": "묘유충", "酉卯": "묘유충",
      "辰戌": "진술충", "戌辰": "진술충", "巳亥": "사해충", "亥巳": "사해충",
    };
    const posNames = ["년지", "월지", "일지", "시지"];

    for (let i = 0; i < natalJiList.length; i++) {
      const natalJi = natalJiList[i];
      const pair = `${ji}${natalJi}`;
      if (YUKHAP_MAP[pair]) {
        natalInteractions.push(`세운 ${ji}와 ${posNames[i]}(${natalJi}) 육합(${YUKHAP_MAP[pair]})`);
      }
      if (CHUNG_MAP[pair]) {
        natalInteractions.push(`세운 ${ji}와 ${posNames[i]}(${natalJi}) 충(${CHUNG_MAP[pair]})`);
      }
    }
  }

  // 세운 키워드 생성
  const keywords = generateSeunKeywords(sipseong, element, dayGan);

  return {
    year,
    ganJi,
    element,
    sipseong,
    keywords,
    jiSipseong,
    natalInteractions,
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

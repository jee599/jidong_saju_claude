// src/lib/saju/constants.ts — 만세력 상수 정의

import type { Cheongan, Jiji, Element } from "./types";

// ─── 천간 10개 ───
export const CHEONGAN_LIST: Cheongan[] = [
  { hanja: "甲", hangul: "갑", element: "木", yinYang: "양", nature: "큰 나무", personality: "리더십, 추진력, 정직", number: 0 },
  { hanja: "乙", hangul: "을", element: "木", yinYang: "음", nature: "풀, 덩굴", personality: "유연함, 적응력, 섬세", number: 1 },
  { hanja: "丙", hangul: "병", element: "火", yinYang: "양", nature: "태양", personality: "열정, 표현력, 화려", number: 2 },
  { hanja: "丁", hangul: "정", element: "火", yinYang: "음", nature: "촛불, 등불", personality: "따뜻함, 집중력, 예리", number: 3 },
  { hanja: "戊", hangul: "무", element: "土", yinYang: "양", nature: "큰 산", personality: "신뢰, 포용력, 안정", number: 4 },
  { hanja: "己", hangul: "기", element: "土", yinYang: "음", nature: "논밭 땅", personality: "온화, 수용적, 실용", number: 5 },
  { hanja: "庚", hangul: "경", element: "金", yinYang: "양", nature: "바위, 철", personality: "결단력, 의리, 강직", number: 6 },
  { hanja: "辛", hangul: "신", element: "金", yinYang: "음", nature: "보석, 금", personality: "예민, 완벽주의, 미적감각", number: 7 },
  { hanja: "壬", hangul: "임", element: "水", yinYang: "양", nature: "바다, 큰 강", personality: "지혜, 포용, 자유", number: 8 },
  { hanja: "癸", hangul: "계", element: "水", yinYang: "음", nature: "이슬, 비", personality: "직관, 인내, 깊은 생각", number: 9 },
];

// ─── 지지 12개 ───
export const JIJI_LIST: Jiji[] = [
  { hanja: "子", hangul: "자", animal: "쥐", element: "水", yinYang: "양", hours: "23:00~01:00", jijanggan: ["癸"], number: 0 },
  { hanja: "丑", hangul: "축", animal: "소", element: "土", yinYang: "음", hours: "01:00~03:00", jijanggan: ["己", "癸", "辛"], number: 1 },
  { hanja: "寅", hangul: "인", animal: "호랑이", element: "木", yinYang: "양", hours: "03:00~05:00", jijanggan: ["甲", "丙", "戊"], number: 2 },
  { hanja: "卯", hangul: "묘", animal: "토끼", element: "木", yinYang: "음", hours: "05:00~07:00", jijanggan: ["乙"], number: 3 },
  { hanja: "辰", hangul: "진", animal: "용", element: "土", yinYang: "양", hours: "07:00~09:00", jijanggan: ["戊", "乙", "癸"], number: 4 },
  { hanja: "巳", hangul: "사", animal: "뱀", element: "火", yinYang: "음", hours: "09:00~11:00", jijanggan: ["丙", "庚", "戊"], number: 5 },
  { hanja: "午", hangul: "오", animal: "말", element: "火", yinYang: "양", hours: "11:00~13:00", jijanggan: ["丁", "己"], number: 6 },
  { hanja: "未", hangul: "미", animal: "양", element: "土", yinYang: "음", hours: "13:00~15:00", jijanggan: ["己", "丁", "乙"], number: 7 },
  { hanja: "申", hangul: "신", animal: "원숭이", element: "金", yinYang: "양", hours: "15:00~17:00", jijanggan: ["庚", "壬", "戊"], number: 8 },
  { hanja: "酉", hangul: "유", animal: "닭", element: "金", yinYang: "음", hours: "17:00~19:00", jijanggan: ["辛"], number: 9 },
  { hanja: "戌", hangul: "술", animal: "개", element: "土", yinYang: "양", hours: "19:00~21:00", jijanggan: ["戊", "辛", "丁"], number: 10 },
  { hanja: "亥", hangul: "해", animal: "돼지", element: "水", yinYang: "음", hours: "21:00~23:00", jijanggan: ["壬", "甲"], number: 11 },
];

// ─── 오행 상생상극 ───
// 상생: 木→火→土→金→水→木
// 상극: 木→土→水→火→金→木
export const OHENG_CYCLE: Record<Element, { generates: Element; controls: Element; generatedBy: Element; controlledBy: Element }> = {
  木: { generates: "火", controls: "土", generatedBy: "水", controlledBy: "金" },
  火: { generates: "土", controls: "金", generatedBy: "木", controlledBy: "水" },
  土: { generates: "金", controls: "水", generatedBy: "火", controlledBy: "木" },
  金: { generates: "水", controls: "木", generatedBy: "土", controlledBy: "火" },
  水: { generates: "木", controls: "火", generatedBy: "金", controlledBy: "土" },
};

// ─── 십성 이름 ───
export const SIPSEONG_NAMES = {
  비견: "비견",
  겁재: "겁재",
  식신: "식신",
  상관: "상관",
  편재: "편재",
  정재: "정재",
  편관: "편관",
  정관: "정관",
  편인: "편인",
  정인: "정인",
} as const;

// ─── 12운성 순서 ───
export const UNSEONG_STAGES = [
  "장생", "목욕", "관대", "건록", "제왕",
  "쇠", "병", "사", "묘", "절", "태", "양",
] as const;

// ─── 12운성 조견표 ───
// 일간 × 지지(子~亥) → 12운성
export const UNSEONG_TABLE: Record<string, string[]> = {
  甲: ["목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양", "장생"],
  乙: ["병", "쇠", "제왕", "건록", "관대", "목욕", "장생", "양", "태", "절", "묘", "사"],
  丙: ["태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절"],
  丁: ["절", "묘", "사", "병", "쇠", "제왕", "건록", "관대", "목욕", "장생", "양", "태"],
  戊: ["태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절"],
  己: ["절", "묘", "사", "병", "쇠", "제왕", "건록", "관대", "목욕", "장생", "양", "태"],
  庚: ["사", "묘", "절", "태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠", "병"],
  辛: ["장생", "양", "태", "절", "묘", "사", "병", "쇠", "제왕", "건록", "관대", "목욕"],
  壬: ["제왕", "쇠", "병", "사", "묘", "절", "태", "양", "장생", "목욕", "관대", "건록"],
  癸: ["건록", "관대", "목욕", "장생", "양", "태", "절", "묘", "사", "병", "쇠", "제왕"],
};

// ─── 시간 → 지지 매핑 ───
export const HOUR_TO_JIJI: { start: number; end: number; ji: string }[] = [
  { start: 23, end: 1, ji: "子" },
  { start: 1, end: 3, ji: "丑" },
  { start: 3, end: 5, ji: "寅" },
  { start: 5, end: 7, ji: "卯" },
  { start: 7, end: 9, ji: "辰" },
  { start: 9, end: 11, ji: "巳" },
  { start: 11, end: 13, ji: "午" },
  { start: 13, end: 15, ji: "未" },
  { start: 15, end: 17, ji: "申" },
  { start: 17, end: 19, ji: "酉" },
  { start: 19, end: 21, ji: "戌" },
  { start: 21, end: 23, ji: "亥" },
];

// ─── 월간 결정 (연간 기준) ───
// 갑기합토: 갑/기 → 丙인월 시작, 을/경 → 戊인월 시작 ...
export const MONTH_GAN_START: Record<string, number> = {
  甲: 2, 己: 2,  // 丙寅부터
  乙: 4, 庚: 4,  // 戊寅부터
  丙: 6, 辛: 6,  // 庚寅부터
  丁: 8, 壬: 8,  // 壬寅부터
  戊: 0, 癸: 0,  // 甲寅부터
};

// ─── 시간 결정 (일간 기준) ───
export const HOUR_GAN_START: Record<string, number> = {
  甲: 0, 己: 0,  // 甲子시부터
  乙: 2, 庚: 2,  // 丙子시부터
  丙: 4, 辛: 4,  // 戊子시부터
  丁: 6, 壬: 6,  // 庚子시부터
  戊: 8, 癸: 8,  // 壬子시부터
};

// ─── 유틸 함수 ───
export function getCheonganByHanja(hanja: string): Cheongan | undefined {
  return CHEONGAN_LIST.find((c) => c.hanja === hanja);
}

export function getJijiByHanja(hanja: string): Jiji | undefined {
  return JIJI_LIST.find((j) => j.hanja === hanja);
}

export function getCheonganElement(hanja: string): Element {
  const found = getCheonganByHanja(hanja);
  if (!found) throw new Error(`Unknown cheongan: ${hanja}`);
  return found.element;
}

export function getJijiElement(hanja: string): Element {
  const found = getJijiByHanja(hanja);
  if (!found) throw new Error(`Unknown jiji: ${hanja}`);
  return found.element;
}

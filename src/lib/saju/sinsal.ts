// src/lib/saju/sinsal.ts — 신살 판별

import type { Sinsal } from "./types";

// ─── 천을귀인 (일간 기준) ───
const CHEONUL: Record<string, string[]> = {
  甲: ["丑", "未"], 乙: ["子", "申"], 丙: ["亥", "酉"],
  丁: ["亥", "酉"], 戊: ["丑", "未"], 己: ["子", "申"],
  庚: ["丑", "未"], 辛: ["寅", "午"], 壬: ["卯", "巳"],
  癸: ["卯", "巳"],
};

// ─── 문창귀인 (일간 기준) ───
const MUNCHANG: Record<string, string> = {
  甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申",
  己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯",
};

// ─── 도화살 (일지/연지 기준) ───
const DOHWA: Record<string, string> = {
  子: "酉", 丑: "午", 寅: "卯", 卯: "子",
  辰: "酉", 巳: "午", 午: "卯", 未: "子",
  申: "酉", 酉: "午", 戌: "卯", 亥: "子",
};

// ─── 역마살 (일지/연지 기준) ───
const YEOKMA: Record<string, string> = {
  子: "寅", 丑: "亥", 寅: "申", 卯: "巳",
  辰: "寅", 巳: "亥", 午: "申", 未: "巳",
  申: "寅", 酉: "亥", 戌: "申", 亥: "巳",
};

// ─── 화개살 (일지/연지 기준) ───
const HWAGAE: Record<string, string> = {
  子: "辰", 丑: "丑", 寅: "戌", 卯: "未",
  辰: "辰", 巳: "丑", 午: "戌", 未: "未",
  申: "辰", 酉: "丑", 戌: "戌", 亥: "未",
};

// ─── 양인살 (일간 기준) ───
const YANGIN: Record<string, string> = {
  甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子",
};

// ─── 홍염살 (일간 기준) ───
const HONGYEOM: Record<string, string> = {
  甲: "午", 乙: "午", 丙: "寅", 丁: "未", 戊: "辰",
  己: "辰", 庚: "戌", 辛: "酉", 壬: "子", 癸: "申",
};

// ─── 천덕귀인 (월지 기준 → 사주 천간/지지에서 찾기) ───
const CHEONDEOK: Record<string, string> = {
  寅: "丁", 卯: "申", 辰: "壬", 巳: "辛",
  午: "亥", 未: "甲", 申: "癸", 酉: "寅",
  戌: "丙", 亥: "乙", 子: "巳", 丑: "庚",
};

// ─── 월덕귀인 (월지 기준 → 사주 천간에서 찾기) ───
const WOLDEOK: Record<string, string> = {
  寅: "丙", 卯: "甲", 辰: "壬", 巳: "庚",
  午: "丙", 未: "甲", 申: "壬", 酉: "庚",
  戌: "丙", 亥: "甲", 子: "壬", 丑: "庚",
};

// ─── 금여록 (일간 기준) ───
const GEUMYEO: Record<string, string> = {
  甲: "辰", 乙: "巳", 丙: "未", 丁: "申", 戊: "未",
  己: "申", 庚: "戌", 辛: "亥", 壬: "丑", 癸: "寅",
};

// ─── 겁살 (일지/연지 기준) ───
const GEOPSAL: Record<string, string> = {
  子: "巳", 丑: "寅", 寅: "亥", 卯: "申",
  辰: "巳", 巳: "寅", 午: "亥", 未: "申",
  申: "巳", 酉: "寅", 戌: "亥", 亥: "申",
};

// ─── 망신살 (일지/연지 기준) ───
const MANGSIN: Record<string, string> = {
  子: "亥", 丑: "申", 寅: "巳", 卯: "寅",
  辰: "亥", 巳: "申", 午: "巳", 未: "寅",
  申: "亥", 酉: "申", 戌: "巳", 亥: "寅",
};

type PillarName = "년지" | "월지" | "일지" | "시지";

/**
 * 사주의 모든 신살을 판별
 */
export function findSinsals(
  dayGan: string,
  yearJi: string,
  monthJi: string,
  dayJi: string,
  hourJi: string,
  yearGan?: string,
  monthGan?: string,
  hourGan?: string
): Sinsal[] {
  const sinsals: Sinsal[] = [];

  const allJi: { ji: string; name: PillarName }[] = [
    { ji: yearJi, name: "년지" },
    { ji: monthJi, name: "월지" },
    { ji: dayJi, name: "일지" },
    { ji: hourJi, name: "시지" },
  ];

  // 천간 목록 (천덕/월덕귀인 검사용)
  const allGanJi = [
    yearGan, monthGan, dayGan, hourGan,
    yearJi, monthJi, dayJi, hourJi,
  ].filter(Boolean) as string[];

  // ── 천을귀인 (일간 기준 → 사주 내 지지에서 찾기) ──
  const cheonulTargets = CHEONUL[dayGan] || [];
  for (const { ji, name } of allJi) {
    if (cheonulTargets.includes(ji)) {
      sinsals.push({
        name: "천을귀인",
        type: "길신",
        location: name,
        meaning: "가장 강력한 귀인. 어려울 때 귀인의 도움을 받음. 위기에서 벗어나는 힘.",
      });
    }
  }

  // ── 문창귀인 (일간 기준) ──
  const munchangTarget = MUNCHANG[dayGan];
  for (const { ji, name } of allJi) {
    if (ji === munchangTarget) {
      sinsals.push({
        name: "문창귀인",
        type: "길신",
        location: name,
        meaning: "학문과 문서에 뛰어난 능력. 시험운이 좋고 문서 관련 일이 잘 풀림.",
      });
    }
  }

  // ── 도화살 (일지 & 연지 기준) ──
  const dohwaByDayJi = DOHWA[dayJi];
  const dohwaByYearJi = DOHWA[yearJi];
  for (const { ji, name } of allJi) {
    if (ji === dohwaByDayJi || ji === dohwaByYearJi) {
      if (!sinsals.some((s) => s.name === "도화살" && s.location === name)) {
        sinsals.push({
          name: "도화살",
          type: "흉신",
          location: name,
          meaning: "매력과 인기의 살. 이성에게 인기가 많으나 색정 문제에 주의.",
        });
      }
    }
  }

  // ── 역마살 (일지 & 연지 기준) ──
  const yeokmaByDayJi = YEOKMA[dayJi];
  const yeokmaByYearJi = YEOKMA[yearJi];
  for (const { ji, name } of allJi) {
    if (ji === yeokmaByDayJi || ji === yeokmaByYearJi) {
      if (!sinsals.some((s) => s.name === "역마살" && s.location === name)) {
        sinsals.push({
          name: "역마살",
          type: "길신",
          location: name,
          meaning: "이동과 변화의 살. 해외 활동, 출장, 이사가 많음. 활동적이고 바쁜 삶.",
        });
      }
    }
  }

  // ── 화개살 (일지 & 연지 기준) ──
  const hwagaeByDayJi = HWAGAE[dayJi];
  const hwagaeByYearJi = HWAGAE[yearJi];
  for (const { ji, name } of allJi) {
    if (ji === hwagaeByDayJi || ji === hwagaeByYearJi) {
      if (!sinsals.some((s) => s.name === "화개살" && s.location === name)) {
        sinsals.push({
          name: "화개살",
          type: "길신",
          location: name,
          meaning: "예술과 종교의 살. 학문·예술적 감성이 뛰어남. 고독을 즐기는 성향.",
        });
      }
    }
  }

  // ── 양인살 (일간 기준) ──
  const yanginTarget = YANGIN[dayGan];
  for (const { ji, name } of allJi) {
    if (ji === yanginTarget) {
      sinsals.push({
        name: "양인살",
        type: "흉신",
        location: name,
        meaning: "날카로운 칼날의 살. 결단력과 추진력이 강하나 과격할 수 있음. 외과·군인에 유리.",
      });
    }
  }

  // ── 홍염살 (일간 기준) ──
  const hongyeomTarget = HONGYEOM[dayGan];
  for (const { ji, name } of allJi) {
    if (ji === hongyeomTarget) {
      sinsals.push({
        name: "홍염살",
        type: "흉신",
        location: name,
        meaning: "강한 매력과 관능의 살. 이성 문제나 감정적 집착에 주의.",
      });
    }
  }

  // ── 겁살 (일지 & 연지 기준) ──
  const geopByDayJi = GEOPSAL[dayJi];
  const geopByYearJi = GEOPSAL[yearJi];
  for (const { ji, name } of allJi) {
    if (ji === geopByDayJi || ji === geopByYearJi) {
      if (!sinsals.some((s) => s.name === "겁살" && s.location === name)) {
        sinsals.push({
          name: "겁살",
          type: "흉신",
          location: name,
          meaning: "외부로부터의 위협·손실의 살. 갑작스러운 사고나 재물 손실에 주의.",
        });
      }
    }
  }

  // ── 망신살 (일지 & 연지 기준) ──
  const mangsinByDayJi = MANGSIN[dayJi];
  const mangsinByYearJi = MANGSIN[yearJi];
  for (const { ji, name } of allJi) {
    if (ji === mangsinByDayJi || ji === mangsinByYearJi) {
      if (!sinsals.some((s) => s.name === "망신살" && s.location === name)) {
        sinsals.push({
          name: "망신살",
          type: "흉신",
          location: name,
          meaning: "명예 실추의 살. 구설이나 체면 손상에 주의. 공개적 망신 가능.",
        });
      }
    }
  }

  // ── 천덕귀인 (월지 기준 → 사주 내 천간/지지에서 찾기) ──
  const cheondeokTarget = CHEONDEOK[monthJi];
  if (cheondeokTarget && allGanJi.includes(cheondeokTarget)) {
    sinsals.push({
      name: "천덕귀인",
      type: "길신",
      location: "월지",
      meaning: "하늘의 덕이 깃든 귀인. 재난을 피하고 복을 받음. 성품이 온화하고 인덕이 있음.",
    });
  }

  // ── 월덕귀인 (월지 기준 → 사주 내 천간에서 찾기) ──
  const woldeokTarget = WOLDEOK[monthJi];
  const allGans = [yearGan, monthGan, dayGan, hourGan].filter(Boolean) as string[];
  if (woldeokTarget && allGans.includes(woldeokTarget)) {
    sinsals.push({
      name: "월덕귀인",
      type: "길신",
      location: "월지",
      meaning: "달의 덕이 깃든 귀인. 재앙이 가벼워지고 복록이 따름. 자비롭고 관대한 성품.",
    });
  }

  // ── 금여록 (일간 기준 → 사주 내 지지에서 찾기) ──
  const geumyeoTarget = GEUMYEO[dayGan];
  for (const { ji, name } of allJi) {
    if (ji === geumyeoTarget) {
      sinsals.push({
        name: "금여록",
        type: "길신",
        location: name,
        meaning: "금으로 된 수레의 록. 재물과 배우자 복이 있음. 결혼운과 재물운이 좋음.",
      });
    }
  }

  return sinsals;
}

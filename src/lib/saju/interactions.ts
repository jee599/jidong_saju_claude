// src/lib/saju/interactions.ts — 합충형파해

import type { Interaction } from "./types";

// ─── 육합 (6쌍) ───
const YUKHAP: [string, string, string][] = [
  ["子", "丑", "토(土)로 합"],
  ["寅", "亥", "목(木)으로 합"],
  ["卯", "戌", "화(火)로 합"],
  ["辰", "酉", "금(金)으로 합"],
  ["巳", "申", "수(水)로 합"],
  ["午", "未", "토(土)로 합"],
];

// ─── 삼합 (4조) ───
const SAMHAP: [string, string, string, string][] = [
  ["寅", "午", "戌", "화국(火局)"],
  ["申", "子", "辰", "수국(水局)"],
  ["巳", "酉", "丑", "금국(金局)"],
  ["亥", "卯", "未", "목국(木局)"],
];

// ─── 방합 (4조) ───
const BANGHAP: [string, string, string, string][] = [
  ["寅", "卯", "辰", "동방 목(木)"],
  ["巳", "午", "未", "남방 화(火)"],
  ["申", "酉", "戌", "서방 금(金)"],
  ["亥", "子", "丑", "북방 수(水)"],
];

// ─── 충 (6쌍) ───
const CHUNG: [string, string, string][] = [
  ["子", "午", "자오충(수화 충돌)"],
  ["丑", "未", "축미충(토토 충돌)"],
  ["寅", "申", "인신충(목금 충돌)"],
  ["卯", "酉", "묘유충(목금 충돌)"],
  ["辰", "戌", "진술충(토토 충돌)"],
  ["巳", "亥", "사해충(화수 충돌)"],
];

// ─── 형 (3종) ───
const HYEONG: [string[], string][] = [
  [["寅", "巳", "申"], "무은지형(삼형살)"],
  [["丑", "戌", "未"], "지세지형(삼형살)"],
  [["子", "卯"], "무례지형"],
  [["辰", "辰"], "자형(진진)"],
  [["午", "午"], "자형(오오)"],
  [["酉", "酉"], "자형(유유)"],
  [["亥", "亥"], "자형(해해)"],
];

// ─── 파 ───
const PA: [string, string][] = [
  ["子", "酉"], ["丑", "辰"], ["寅", "亥"],
  ["卯", "午"], ["巳", "申"], ["未", "戌"],
];

// ─── 해 ───
const HAE: [string, string][] = [
  ["子", "未"], ["丑", "午"], ["寅", "巳"],
  ["卯", "辰"], ["申", "亥"], ["酉", "戌"],
];

type PillarPosition = "년지" | "월지" | "일지" | "시지";

/**
 * 사주 4기둥의 지지 간 상호작용(합충형파해)을 모두 찾기
 */
export function findInteractions(
  yearJi: string,
  monthJi: string,
  dayJi: string,
  hourJi: string
): { haps: Interaction[]; chungs: Interaction[]; hyeongs: Interaction[] } {
  const jiList: { ji: string; pos: PillarPosition }[] = [
    { ji: yearJi, pos: "년지" },
    { ji: monthJi, pos: "월지" },
    { ji: dayJi, pos: "일지" },
    { ji: hourJi, pos: "시지" },
  ];

  const haps: Interaction[] = [];
  const chungs: Interaction[] = [];
  const hyeongs: Interaction[] = [];

  // 모든 2개 쌍 조합 검사
  for (let i = 0; i < jiList.length; i++) {
    for (let j = i + 1; j < jiList.length; j++) {
      const a = jiList[i];
      const b = jiList[j];

      // 육합 검사
      for (const [x, y, desc] of YUKHAP) {
        if ((a.ji === x && b.ji === y) || (a.ji === y && b.ji === x)) {
          haps.push({
            type: "육합",
            elements: [a.ji, b.ji],
            description: `${a.pos}(${a.ji})와 ${b.pos}(${b.ji})의 육합 — ${desc}`,
          });
        }
      }

      // 충 검사
      for (const [x, y, desc] of CHUNG) {
        if ((a.ji === x && b.ji === y) || (a.ji === y && b.ji === x)) {
          chungs.push({
            type: "충",
            elements: [a.ji, b.ji],
            description: `${a.pos}(${a.ji})와 ${b.pos}(${b.ji})의 ${desc}`,
          });
        }
      }

      // 형 검사 (2개짜리)
      for (const [pair, desc] of HYEONG) {
        if (pair.length === 2) {
          if ((a.ji === pair[0] && b.ji === pair[1]) || (a.ji === pair[1] && b.ji === pair[0])) {
            hyeongs.push({
              type: "형",
              elements: [a.ji, b.ji],
              description: `${a.pos}(${a.ji})와 ${b.pos}(${b.ji})의 ${desc}`,
            });
          }
        }
      }
    }
  }

  // 삼합 검사 (3개 조합)
  const jiSet = new Set([yearJi, monthJi, dayJi, hourJi]);
  const jiArray = [yearJi, monthJi, dayJi, hourJi];

  for (const [a, b, c, desc] of SAMHAP) {
    const matchCount = [a, b, c].filter((x) => jiSet.has(x)).length;
    if (matchCount >= 2) {
      const matched = [a, b, c].filter((x) => jiSet.has(x));
      const positions = matched
        .map((ji) => {
          const idx = jiArray.indexOf(ji);
          return `${["년지", "월지", "일지", "시지"][idx]}(${ji})`;
        })
        .join("·");

      haps.push({
        type: matchCount === 3 ? "삼합" : "반합",
        elements: matched,
        description: `${positions}의 ${matchCount === 3 ? "삼합" : "반합"} — ${desc}`,
      });
    }
  }

  // 방합 검사
  for (const [a, b, c, desc] of BANGHAP) {
    const matchCount = [a, b, c].filter((x) => jiSet.has(x)).length;
    if (matchCount === 3) {
      haps.push({
        type: "방합",
        elements: [a, b, c],
        description: `${desc} 방합`,
      });
    }
  }

  // 삼형 검사 (3개짜리)
  for (const [trio, desc] of HYEONG) {
    if (trio.length === 3) {
      const matchCount = trio.filter((x) => jiSet.has(x)).length;
      if (matchCount >= 2) {
        const matched = trio.filter((x) => jiSet.has(x));
        hyeongs.push({
          type: "삼형",
          elements: matched,
          description: `${matched.join("·")}의 ${desc}`,
        });
      }
    }
  }

  return { haps, chungs, hyeongs };
}

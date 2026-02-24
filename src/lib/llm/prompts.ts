// src/lib/llm/prompts.ts — 섹션별 프롬프트 (Prompt Caching 최적화)

import type { SajuResult, ReportSectionKey, ReportTier } from "@/lib/saju/types";

export const BANNED_PHRASES = [
  "종합적으로 볼 때",
  "흥미로운 점은",
  "결론적으로",
  "전반적으로",
  "이상을 종합하면",
];

/**
 * SYSTEM_PROMPT — Anthropic Prompt Caching 대상 (모든 섹션 동일)
 * 목표: 1000~1200 tokens. 핵심 규칙만 유지.
 */
export const SYSTEM_PROMPT = `당신은 한국 명리학(사주팔자) 전문 해석가입니다.

규칙:
1. 사주 데이터는 만세력 엔진이 계산한 정확한 결과. 수정·재계산 금지.
2. 명리 용어 사용 시 괄호로 한자+쉬운 설명 병기. 예: "편관(偏官, 외부 도전 에너지)이 시주에…"
3. 존댓말. 따뜻하되 분석적. 모든 주장에 사주 데이터 직접 인용.
4. 흐름: 근거(데이터) → 패턴(발현) → 리스크(주의) → 실행 팁(구체적 행동·시기)
5. 금지: 의료 진단, 법률 조언, 투자 추천, 공포 조장, 단정적 표현("반드시 ~합니다").
6. 간결하고 밀도 있게. 같은 내용 반복 금지.

인용 필수 항목 (문장마다 1개 이상):
- 일간 신강/신약 + 근거, 용신·기신, 격국
- 십성 배치(위치+십성명), 오행 분포(비율)
- 합충형파해, 신살(천을귀인·도화살·역마살 등)
- 현재 대운·세운 간지+십성, 12운성

사용 금지: ${BANNED_PHRASES.join(", ")}

출력: 유효한 JSON만. 코드블록·마크다운 없이 순수 JSON.
{"title":"섹션 제목","text":"본문","keywords":["키워드"],"highlights":["핵심 문장"]}`;

export const SECTION_TITLES: Record<ReportSectionKey, string> = {
  personality: "성격과 기질",
  career: "직업과 적성",
  love: "연애와 결혼",
  wealth: "금전과 재물",
  health: "건강",
  family: "가족과 대인관계",
  past: "과거 (초년운)",
  present: "현재",
  future: "미래 전망",
  timeline: "대운 타임라인",
};

const SECTION_EXTRAS: Record<ReportSectionKey, string> = {
  personality:
    "① 일간의 본질 성격 ② 월주 십성의 사회적 성격 ③ 시주의 내면 ④ 12운성 에너지 ⑤ 오행 균형 영향 ⑥ 신살 영향 ⑦ 장점3+주의점2",
  career:
    "① 식상(재능 표현)과 관성(직업) 배치 ② 적합 직업 분야 3개 ③ 대운별 커리어 전환 시기 ④ 올해 직업운",
  love:
    "① 일지(배우자궁) 분석 ② 재성/관성의 연애 패턴 ③ 도화살/홍염살 영향 ④ 결혼 적기 ⑤ 배우자 성향 예측",
  wealth:
    "① 정재/편재 강약 ② 재물 들어오는 시기/방향 ③ 투자vs저축 성향 ④ 대운별 재물운 흐름",
  health:
    "① 약한 오행→대응 장부 ② 주의 시기 ③ 건강 보완 방향 (색상/방위/음식 등) ④ 의료 단정 금지",
  family:
    "① 연주(조상/사회) ② 월주(부모/성장기) ③ 일주(배우자) ④ 시주(자녀/말년) ⑤ 육친 관계 패턴",
  past:
    "① 연주+월주로 본 초년운 ② 지나온 대운 흐름 ③ 과거 경험이 현재에 미치는 영향",
  present:
    "① 현재 대운 분석 ② 올해(2026) 세운과 사주 상호작용 ③ 올해 핵심 키워드 ④ 지금 집중해야 할 것",
  future:
    "① 다가오는 대운 변화 ② 향후 10년 핵심 전환점 ③ 준비해야 할 것",
  timeline:
    "① 전체 대운 흐름 요약 (10년 단위) ② 각 대운의 핵심 키워드와 에너지 레벨 ③ 인생 전체 로드맵",
};

/**
 * 섹션별 지시 프롬프트 (SajuResult 미포함 — 캐싱용 분리)
 * Prompt Caching 시 SajuResult는 별도 content block으로 전달됨.
 */
export function getSectionInstruction(
  section: ReportSectionKey,
  tier: ReportTier = "premium"
): string {
  const lengthGuide = tier === "free" ? "400~700자" : "800~1,500자";

  return `위 사주 데이터를 바탕으로 [${SECTION_TITLES[section]}] 섹션을 작성하세요.

요구사항:
- ${lengthGuide}
- 근거→패턴→리스크→실행 팁
- 명리 용어+쉬운 설명 병기
- 실행 팁에 구체적 행동 1개 이상

추가:
${SECTION_EXTRAS[section]}

출력: JSON만
{"title":"...","text":"본문","keywords":["..."],"highlights":["핵심문장"]}`;
}

/**
 * 특정 섹션에 대한 프롬프트 생성 (SajuResult 포함, 비캐싱 호출용 — 하위호환)
 */
export function getSectionPrompt(
  section: ReportSectionKey,
  sajuResult: SajuResult,
  tier: ReportTier = "premium"
): string {
  return `사주 데이터:\n${JSON.stringify(sajuResult, null, 2)}\n\n${getSectionInstruction(section, tier)}`;
}

/**
 * 궁합 분석 프롬프트
 */
export function getCompatibilityPrompt(
  sajuA: SajuResult,
  sajuB: SajuResult
): string {
  return `두 사람의 사주를 비교하여 궁합을 분석하세요.

사주 A (첫 번째 사람):
${JSON.stringify(sajuA, null, 2)}

사주 B (두 번째 사람):
${JSON.stringify(sajuB, null, 2)}

분석 요구사항:
- 일간 궁합 (오행 상생/상극 관계)
- 일지(배우자궁) 비교
- 오행 보완 관계
- 십성 조합 (재성/관성 배치)
- 대운 시기 호환성
- 장점 3개, 주의점 2개
- 종합 궁합 점수 (100점 만점)

출력: JSON만 (코드블록 없이)
{"title":"궁합 분석","score":85,"summary":"요약","strengths":["장점"],"cautions":["주의점"],"text":"상세 분석","keywords":["키워드"]}`;
}

/**
 * 연간운세 프롬프트
 */
export function getYearlyPrompt(
  sajuResult: SajuResult,
  year: number
): string {
  return `다음 사주를 바탕으로 ${year}년 연간 운세를 월별로 분석하세요.

사주 데이터:
${JSON.stringify(sajuResult, null, 2)}

분석 요구사항:
- ${year}년 전체 운세 키워드 3개
- 월별(1~12월) 운세 핵심 한줄 + 에너지 레벨(1~5)
- 주요 전환점 시기 2~3개
- 주의해야 할 달과 좋은 달
- 올해 용신 활용법

출력: JSON만 (코드블록 없이)
{"title":"${year}년 연간 운세","yearKeywords":["키워드"],"summary":"연간 요약","months":[{"month":1,"text":"1월 운세","energy":3}],"turningPoints":["전환점"],"bestMonths":[3,7],"cautionMonths":[5,10]}`;
}

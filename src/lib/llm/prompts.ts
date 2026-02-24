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
 */
export const SYSTEM_PROMPT = `당신은 사주를 쉽고 따뜻하게 풀어주는 운명 상담사입니다.

핵심 원칙:
1. 사주 데이터는 정확히 계산된 결과입니다. 수정하지 마세요.
2. 한자를 쓰지 마세요. 한글과 비유로 설명하세요.
   - 좋은 예: "당신의 에너지 중심은 '흙'이에요. 큰 산처럼 듬직하고 포용력 있는 성격이죠."
   - 나쁜 예: "戊土 일간이 편관격(偏官格)으로 신강(身强)한 구조를 형성하여…"
3. 전문 용어는 최소화하세요. 꼭 필요하면 괄호 안에 짧게 풀어쓰세요.
   - 좋은 예: "사주에서 '나를 도와주는 에너지(인성)'가 강해서…"
   - 나쁜 예: "편인(偏印)이 투출하여 정인(正印)과 혼잡하므로…"
4. 친구에게 이야기하듯 편하지만 존댓말로 쓰세요.
5. 사주 데이터를 자연스럽게 녹여서 설명하세요. 날것의 데이터를 나열하지 마세요.
6. 구조: 핵심 이야기 → 실생활에서 어떻게 나타나는지 → 주의할 점 → 구체적 조언
7. 금지: 의료 진단, 법률 조언, 투자 추천, 공포 조장, "반드시 ~합니다".
8. 반복 금지. 짧고 핵심적으로.

문체 가이드:
- 따뜻하고 응원하는 톤. 마치 좋은 선배가 조언해주는 느낌.
- 비유와 일상 예시 적극 활용
- 오행은 "나무, 불, 흙, 금속, 물" 한글로
- 문단을 짧게 나누어 읽기 쉽게 (2~3문장씩)
- 핵심 포인트는 **이렇게** 굵게 강조

사용 금지: ${BANNED_PHRASES.join(", ")}

출력: 유효한 JSON만. 코드블록 없이 순수 JSON.
{"title":"섹션 제목","text":"본문(\\n\\n으로 문단 구분, **강조** 사용)","keywords":["쉬운 한글 키워드"],"highlights":["핵심 한줄"]}`;

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
    "① 타고난 본질적 성격을 자연물에 비유해서 설명 ② 사회생활에서 보이는 모습 ③ 혼자 있을 때의 내면 ④ 에너지 상태 (활발한지 차분한지) ⑤ 오행 균형이 성격에 미치는 영향 ⑥ 장점 3개 + 조심할 점 2개",
  career:
    "① 어떤 재능이 있고 어떻게 발휘하면 좋은지 ② 잘 맞는 직업/분야 3가지 (구체적으로) ③ 커리어 전환이 오는 시기 ④ 올해 직업운은 어떤지",
  love:
    "① 연애 스타일과 사랑의 패턴 ② 어떤 사람에게 끌리고 잘 맞는지 ③ 매력 포인트와 연애 주의점 ④ 좋은 인연이 오는 시기 ⑤ 미래 배우자 성향 예측",
  wealth:
    "① 돈을 버는 스타일 (꾸준한 월급형 vs 한방형) ② 돈이 잘 들어오는 시기 ③ 투자 vs 저축 어떤 게 맞는지 ④ 시기별 재물운 흐름",
  health:
    "① 약한 에너지와 연결된 신체 부위 ② 건강에 주의할 시기 ③ 보완 방법 (좋은 색상, 방향, 음식 등) ④ 의학적 단정은 금지",
  family:
    "① 어린 시절 가정환경과 부모 관계 ② 형제자매 관계 ③ 배우자와의 궁합 포인트 ④ 자녀운과 노후 ⑤ 대인관계 패턴",
  past:
    "① 어린 시절부터 지금까지 어떤 흐름이었는지 ② 지나온 인생의 큰 줄기 ③ 과거 경험이 지금의 나에게 어떤 영향을 주는지",
  present:
    "① 지금 인생에서 어떤 시기인지 ② 올해(2026년) 어떤 에너지가 흐르는지 ③ 올해 핵심 키워드 3개 ④ 지금 가장 집중해야 할 것",
  future:
    "① 앞으로 다가오는 큰 변화 ② 향후 10년 중 가장 중요한 전환점 ③ 미리 준비하면 좋을 것",
  timeline:
    "① 인생 전체를 10년 단위로 쭉 훑어주기 ② 각 시기의 핵심 키워드와 에너지 흐름 ③ 인생 전체 로드맵을 한눈에 보여주기",
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
- 한자 사용 금지. 쉬운 한글로만 설명
- 비유와 예시를 활용해서 누구나 이해할 수 있게
- 핵심 → 실생활 예시 → 주의점 → 구체적 조언 1개 이상
- **강조**로 핵심 포인트 표시, \\n\\n으로 문단 구분

다룰 내용:
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

// src/lib/saju/interpretations.ts — Algorithmic text generation for free tier
//
// Replaces LLM calls for free tier with rule-based interpretations.
// Maps dayMaster, sipseong distribution, oheng balance, geokguk, yongsin
// into human-readable Korean text for each section.

import type {
  SajuResult,
  Element,
  ReportSection,
  ReportSectionKey,
  GeokGukName,
} from "./types";
import { OHENG_CYCLE } from "./constants";

// ─── Day Master personality interpretations ───

const DAY_MASTER_PERSONALITY: Record<string, string> = {
  甲: "큰 나무의 기운을 타고난 갑(甲) 일간은 곧고 정직하며, 리더십이 강합니다. 한번 정한 방향은 쉽게 바꾸지 않는 추진력이 있지만, 때로는 융통성이 부족할 수 있습니다. 성장과 발전을 중시하며, 주변에 든든한 버팀목이 되어줍니다.",
  乙: "풀과 덩굴의 기운을 가진 을(乙) 일간은 부드럽고 유연하며, 적응력이 뛰어납니다. 어떤 환경에서든 뿌리를 내리는 능력이 있고, 섬세한 감각으로 주변을 살핍니다. 외유내강형으로 겉은 온화하지만 속은 강인합니다.",
  丙: "태양의 기운을 품은 병(丙) 일간은 열정적이고 화려하며, 주변을 밝게 비추는 존재입니다. 표현력이 풍부하고 사교적이며, 긍정적 에너지로 사람들을 끌어당깁니다. 다만 감정 기복이 있을 수 있습니다.",
  丁: "촛불과 등불의 기운을 가진 정(丁) 일간은 따뜻하면서도 예리한 통찰력을 지닙니다. 조용히 빛나며 주변을 밝히고, 집중력이 뛰어나 한 분야에서 깊은 전문성을 발휘합니다. 섬세하고 직관적입니다.",
  戊: "큰 산의 기운을 지닌 무(戊) 일간은 믿음직하고 포용력이 넓으며, 안정감을 줍니다. 중심을 잡는 능력이 뛰어나고, 한번 맡은 일은 책임감 있게 완수합니다. 변화보다는 안정을 선호합니다.",
  己: "논밭 땅의 기운을 가진 기(己) 일간은 온화하고 수용적이며, 실용적인 감각이 뛰어납니다. 다른 사람의 말에 귀 기울이고 조화를 중시하며, 꾸준하게 성과를 쌓아가는 타입입니다.",
  庚: "바위와 철의 기운을 품은 경(庚) 일간은 결단력이 있고 의리를 중시하며, 강직한 성품을 지닙니다. 불의에 타협하지 않는 강인함이 있으나, 다소 완고할 수 있습니다. 실행력이 매우 뛰어납니다.",
  辛: "보석과 금의 기운을 가진 신(辛) 일간은 예민하고 감각적이며, 완벽주의적 성향이 있습니다. 미적 감각이 뛰어나고 디테일에 강하며, 자존심이 높습니다. 내면의 빛을 스스로 갈고 닦는 타입입니다.",
  壬: "바다와 큰 강의 기운을 지닌 임(壬) 일간은 지혜롭고 포용력이 크며, 자유를 사랑합니다. 상황 판단이 빠르고 변화에 유연하게 대처하며, 넓은 시야로 세상을 바라봅니다.",
  癸: "이슬과 비의 기운을 가진 계(癸) 일간은 직관력이 뛰어나고 인내심이 강하며, 깊이 있는 사고를 합니다. 조용하지만 꾸준한 영향력을 발휘하며, 감수성이 풍부합니다.",
};

// ─── Geokguk career interpretations ───

const GEOKGUK_CAREER: Record<GeokGukName, string> = {
  정관격: "정관격(正官格)은 조직 안에서 빛나는 구조입니다. 공무원, 대기업, 법조, 행정 분야에서 안정적으로 성과를 내기 좋습니다. 규칙과 질서를 중시하며, 체계적 커리어 발전이 가능합니다.",
  편관격: "편관격(偏官格)은 도전과 변화 속에서 실력을 발휘하는 구조입니다. 군·경찰, 스포츠, 창업, 위기관리 등 역동적인 분야에 적합하며, 경쟁에서 강한 면모를 보입니다.",
  정인격: "정인격(正印格)은 학문과 지식을 통해 성장하는 구조입니다. 교육, 연구, 출판, 컨설팅 등 지적 활동 분야에서 두각을 나타내며, 깊이 있는 전문성을 쌓기 유리합니다.",
  편인격: "편인격(偏印格)은 독창적이고 비주류적인 분야에서 빛나는 구조입니다. IT, 예술, 철학, 대체의학, 특수 분야 등에서 독보적인 존재가 될 수 있습니다.",
  식신격: "식신격(食神格)은 재능을 표현하며 풍요를 누리는 구조입니다. 요리, 예술, 콘텐츠 제작, 교육, 서비스업 등 자신의 능력을 나누는 분야에 적합합니다.",
  상관격: "상관격(傷官格)은 기존의 틀을 깨고 혁신하는 구조입니다. 연예, 법률, 마케팅, 스타트업 등 변화와 창의성이 필요한 분야에서 성공할 가능성이 높습니다.",
  정재격: "정재격(正財格)은 성실한 노력으로 재물을 모으는 구조입니다. 금융, 회계, 부동산, 유통 등 꾸준한 수익이 발생하는 분야에 적합하며, 안정적 재테크 능력이 있습니다.",
  편재격: "편재격(偏財格)은 큰 규모의 돈을 다루는 구조입니다. 무역, 투자, 사업, 영업 등 자금 흐름이 큰 분야에서 두각을 나타내며, 사교적 능력이 재물운으로 연결됩니다.",
  건록격: "건록격(建祿格)은 자기 실력으로 승부하는 구조입니다. 전문직, 프리랜서, 자영업 등 독립적으로 일하며 역량을 인정받는 분야에 적합합니다. 독립심이 강합니다.",
  양인격: "양인격(羊刃格)은 강한 에너지를 올바르게 쓸 때 빛나는 구조입니다. 외과의, 군인, 스포츠 선수, CEO 등 결단력과 추진력이 필요한 분야에서 성공할 수 있습니다.",
};

// ─── Oheng health mapping ───

const OHENG_HEALTH: Record<Element, string> = {
  木: "木 기운이 약하면 간·담·눈·근육 쪽에 주의가 필요합니다. 초록색 채소와 신맛 음식이 도움이 되며, 산책이나 숲 활동으로 보강할 수 있습니다.",
  火: "火 기운이 약하면 심장·소장·혈액순환 쪽에 주의가 필요합니다. 붉은색 음식과 적절한 유산소 운동이 도움이 되며, 따뜻한 환경이 좋습니다.",
  土: "土 기운이 약하면 위장·비장·소화기관 쪽에 주의가 필요합니다. 노란색 음식과 단맛이 도움이 되며, 규칙적인 식사 습관이 중요합니다.",
  金: "金 기운이 약하면 폐·대장·피부·호흡기 쪽에 주의가 필요합니다. 흰색 음식과 매운맛이 도움이 되며, 깨끗한 공기와 호흡 운동이 좋습니다.",
  水: "水 기운이 약하면 신장·방광·생식기·뼈 쪽에 주의가 필요합니다. 검은색 음식과 짠맛이 도움이 되며, 충분한 수분 섭취와 하체 운동이 좋습니다.",
};

// ─── Sipseong-based love patterns ───

const LOVE_PATTERNS: Record<string, string> = {
  정재: "정재(正財)가 강한 사주는 안정적이고 헌신적인 연애를 합니다. 한 사람에게 깊이 집중하며, 가정적이고 책임감 있는 파트너를 만나기 좋습니다.",
  편재: "편재(偏財)가 강한 사주는 사교적이고 활발한 연애 패턴을 보입니다. 다양한 만남의 기회가 있으며, 인연의 폭이 넓지만 깊이를 챙기는 노력이 필요합니다.",
  정관: "정관(正官)이 강한 사주는 격식 있고 진지한 연애를 추구합니다. 사회적으로 안정된 파트너를 선호하며, 결혼으로 이어지는 연애를 합니다.",
  편관: "편관(偏官)이 강한 사주는 강렬하고 역동적인 연애를 경험합니다. 카리스마 있는 상대에게 끌리며, 밀고 당기기가 있는 드라마틱한 관계가 될 수 있습니다.",
  비견: "비견(比肩)이 강한 사주는 독립적인 연애를 합니다. 상대와 대등한 관계를 원하며, 자존심이 강해 양보가 어려울 수 있지만 진심어린 동반자 관계를 만듭니다.",
  겁재: "겁재(劫財)가 강한 사주는 적극적이고 경쟁적인 연애 패턴을 보입니다. 감정 표현이 직접적이며, 연인에 대한 소유욕이 강할 수 있습니다.",
  식신: "식신(食神)이 강한 사주는 다정하고 편안한 연애를 합니다. 상대를 잘 돌보고 함께하는 시간을 즐기며, 맛있는 음식과 좋은 경험을 나누는 관계를 원합니다.",
  상관: "상관(傷官)이 강한 사주는 자유롭고 표현력 풍부한 연애를 합니다. 감정 표현이 화려하고 로맨틱하지만, 이상이 높아 현실과의 간극에 주의가 필요합니다.",
  편인: "편인(偏印)이 강한 사주는 독특하고 개성적인 연애를 합니다. 남다른 취향의 파트너를 만나기 쉬우며, 정신적 교감을 중시합니다.",
  정인: "정인(正印)이 강한 사주는 따뜻하고 포근한 연애를 추구합니다. 정서적 안정을 주는 파트너를 선호하며, 서로를 성장시키는 관계를 만듭니다.",
};

// ─── Yongsin advice text ───

const YONGSIN_ADVICE: Record<Element, string> = {
  木: "용신이 木(목)이므로, 동쪽 방위가 길하고, 초록색 계열을 활용하면 좋습니다. 나무와 관련된 업종(교육, 출판, 패션)이나 봄철에 좋은 기운이 찾아옵니다.",
  火: "용신이 火(화)이므로, 남쪽 방위가 길하고, 빨간색·보라색 계열을 활용하면 좋습니다. 빛과 열 관련 분야(미디어, 에너지, 엔터테인먼트)나 여름철에 운이 상승합니다.",
  土: "용신이 土(토)이므로, 중앙이 길하고, 노란색·갈색 계열을 활용하면 좋습니다. 부동산, 건축, 농업 관련 분야에서 기회가 열리며, 환절기에 좋은 흐름이 옵니다.",
  金: "용신이 金(금)이므로, 서쪽 방위가 길하고, 흰색·금색 계열을 활용하면 좋습니다. 금융, IT, 기계 관련 분야에서 성과가 기대되며, 가을철에 운이 열립니다.",
  水: "용신이 水(수)이므로, 북쪽 방위가 길하고, 검정색·파란색 계열을 활용하면 좋습니다. 유통, 해운, 커뮤니케이션 분야에서 기회가 열리며, 겨울철에 운이 강해집니다.",
};

// ─── Present / Current year interpretation ───

function generatePresentText(result: SajuResult): string {
  const seun = result.seun;
  const dm = result.dayMaster;
  const currentDaeun = result.daeun.find((d) => d.isCurrentDaeun);

  let text = `${seun.year}년은 ${seun.ganJi}(${seun.element})의 해입니다. `;
  text += `일간 ${dm.gan}(${dm.element})에게 ${seun.sipseong}의 에너지가 흐릅니다. `;

  if (seun.sipseong === "비견" || seun.sipseong === "겁재") {
    text += "올해는 자기 주도적으로 움직이기 좋은 시기입니다. 독립적인 프로젝트나 새로운 도전이 유리하며, 경쟁 상황에서도 자신감을 유지하세요. ";
  } else if (seun.sipseong === "식신" || seun.sipseong === "상관") {
    text += "올해는 재능을 표현하고 창작 활동에 집중하기 좋은 시기입니다. 새로운 아이디어가 떠오르고, 자신만의 콘텐츠나 기술을 발전시킬 기회가 옵니다. ";
  } else if (seun.sipseong === "편재" || seun.sipseong === "정재") {
    text += "올해는 재물운이 열리는 시기입니다. 수입 증가나 새로운 수익원이 생길 수 있으며, 현실적인 계획을 세우면 성과로 이어집니다. ";
  } else if (seun.sipseong === "편관" || seun.sipseong === "정관") {
    text += "올해는 사회적 위상이 변화하는 시기입니다. 승진, 이직, 새로운 역할이 주어질 수 있으며, 책임감을 가지고 임하면 인정받습니다. ";
  } else if (seun.sipseong === "편인" || seun.sipseong === "정인") {
    text += "올해는 배움과 성장의 시기입니다. 공부, 자격증, 새로운 분야 탐구에 좋으며, 멘토나 조력자의 도움을 받기 좋습니다. ";
  }

  if (currentDaeun) {
    text += `현재 대운은 ${currentDaeun.ganji}(${currentDaeun.period})으로, ${currentDaeun.sipseong}의 에너지가 지배적입니다. `;
  }

  if (seun.keywords.length > 0) {
    text += `올해 핵심 키워드: ${seun.keywords.join(", ")}.`;
  }

  return text;
}

/**
 * Generate algorithmic (non-LLM) report sections for free tier.
 * Returns 4 sections: personality, career, love, present
 */
export function generateAlgorithmicSections(
  result: SajuResult
): Record<ReportSectionKey, ReportSection> {
  const dm = result.dayMaster;
  const oheng = result.oheng;
  const yongsin = result.yongsin;
  const geokguk = result.geokguk;
  const sipseong = result.sipseong;

  // ── Personality ──
  const personalityBase = DAY_MASTER_PERSONALITY[dm.gan] ?? "";
  const strengthNote = dm.isStrong
    ? "신강(身强)한 사주로, 주체적이고 자신감이 넘칩니다. 다만 지나친 고집은 주의하세요."
    : "신약(身弱)한 사주로, 섬세한 감수성이 강점입니다. 좋은 환경과 조력자가 있을 때 더욱 빛납니다.";
  const ohengNote = `오행 분포를 보면 ${oheng.strongest} 기운이 가장 강하고 ${oheng.weakest} 기운이 상대적으로 약합니다. ${yongsin.yongsin} 오행을 보강하면 균형이 잡힙니다.`;

  const personalitySection: ReportSection = {
    title: "성격과 기질",
    text: `${personalityBase}\n\n${strengthNote}\n\n${ohengNote}`,
    keywords: [dm.nature, dm.element, sipseong.dominant],
    highlights: [personalityBase.split(".")[0] + "."],
  };

  // ── Career ──
  const careerBase = GEOKGUK_CAREER[geokguk.name] ?? "";
  const yongsinCareer = YONGSIN_ADVICE[yongsin.yongsin] ?? "";

  const careerSection: ReportSection = {
    title: "직업과 적성",
    text: `${careerBase}\n\n${geokguk.basis}.\n\n${yongsinCareer}`,
    keywords: [geokguk.name, yongsin.yongsin],
    highlights: [careerBase.split(".")[0] + "."],
  };

  // ── Love ──
  const lovePattern = LOVE_PATTERNS[sipseong.dominant] ?? LOVE_PATTERNS["비견"];
  const dayJiSipseong = sipseong.details?.dayJi ?? "비견";
  const dayJiNote = `일지(배우자궁)에 ${dayJiSipseong}이(가) 자리하고 있어, 배우자와의 관계에서 ${
    dayJiSipseong === "정재" || dayJiSipseong === "정관" ? "안정적이고 조화로운" :
    dayJiSipseong === "편재" || dayJiSipseong === "편관" ? "역동적이고 변화가 있는" :
    dayJiSipseong === "식신" ? "편안하고 다정한" :
    dayJiSipseong === "상관" ? "자유롭고 표현적인" :
    "대등하고 독립적인"
  } 패턴이 나타납니다.`;

  // Check for love-related sinsals
  const hasDohwa = result.sinsals.some((s) => s.name.includes("도화"));
  const hasHongyeom = result.sinsals.some((s) => s.name.includes("홍염"));
  let sinsalNote = "";
  if (hasDohwa) sinsalNote += "도화살(桃花殺)이 있어 이성에게 매력적으로 보이며, 사교적인 면이 강합니다. ";
  if (hasHongyeom) sinsalNote += "홍염살(紅艶殺)이 있어 강한 매력과 로맨틱한 기운이 있습니다. ";

  const loveSection: ReportSection = {
    title: "연애와 결혼",
    text: `${lovePattern}\n\n${dayJiNote}\n\n${sinsalNote}`,
    keywords: [sipseong.dominant, dayJiSipseong],
    highlights: [lovePattern.split(".")[0] + "."],
  };

  // ── Present ──
  const presentText = generatePresentText(result);

  const presentSection: ReportSection = {
    title: "현재",
    text: presentText,
    keywords: result.seun.keywords.length > 0 ? result.seun.keywords : [result.seun.element],
    highlights: [`${result.seun.year}년 ${result.seun.sipseong}의 에너지`],
  };

  return {
    personality: personalitySection,
    career: careerSection,
    love: loveSection,
    present: presentSection,
    // The following are premium-only and not generated here
    wealth: { title: "금전과 재물", text: "", keywords: [], highlights: [] },
    health: { title: "건강", text: "", keywords: [], highlights: [] },
    family: { title: "가족과 대인관계", text: "", keywords: [], highlights: [] },
    past: { title: "과거 (초년운)", text: "", keywords: [], highlights: [] },
    future: { title: "미래 전망", text: "", keywords: [], highlights: [] },
    timeline: { title: "대운 타임라인", text: "", keywords: [], highlights: [] },
  };
}

export interface TermInfo {
  hanja: string;
  description: string;
}

export const SAJU_TERMS: Record<string, TermInfo> = {
  // 십성
  "비견": { hanja: "比肩", description: "나와 같은 오행, 같은 음양. 경쟁자이자 동료의 에너지" },
  "겁재": { hanja: "劫財", description: "나와 같은 오행, 다른 음양. 강한 경쟁과 도전의 에너지" },
  "식신": { hanja: "食神", description: "내가 생하는 오행, 같은 음양. 재능과 표현의 에너지" },
  "상관": { hanja: "傷官", description: "내가 생하는 오행, 다른 음양. 창의성과 반항의 에너지" },
  "편재": { hanja: "偏財", description: "내가 극하는 오행, 같은 음양. 유동적 재물과 사업의 에너지" },
  "정재": { hanja: "正財", description: "내가 극하는 오행, 다른 음양. 안정적 재물과 저축의 에너지" },
  "편관": { hanja: "偏官", description: "나를 극하는 오행, 같은 음양. 외부 도전과 압박의 에너지" },
  "정관": { hanja: "正官", description: "나를 극하는 오행, 다른 음양. 질서와 책임의 에너지" },
  "편인": { hanja: "偏印", description: "나를 생하는 오행, 같은 음양. 비전통적 학문과 영감의 에너지" },
  "정인": { hanja: "正印", description: "나를 생하는 오행, 다른 음양. 학문과 어머니의 에너지" },
  // 12운성
  "장생": { hanja: "長生", description: "에너지가 태어나는 단계. 새로운 시작과 성장의 기운" },
  "목욕": { hanja: "沐浴", description: "성장하며 불안정한 단계. 변화와 도전의 시기" },
  "관대": { hanja: "冠帶", description: "성인이 되는 단계. 자신감과 독립의 에너지" },
  "건록": { hanja: "建祿", description: "사회적으로 자리잡는 단계. 안정과 실력 발휘" },
  "제왕": { hanja: "帝旺", description: "에너지가 최고조인 단계. 권위와 성취의 정점" },
  "쇠": { hanja: "衰", description: "에너지가 줄어드는 단계. 성숙과 절제의 시기" },
  "병": { hanja: "病", description: "에너지가 약해지는 단계. 내면 성찰의 시기" },
  "사": { hanja: "死", description: "에너지가 멈추는 단계. 전환과 재정비의 시기" },
  "묘": { hanja: "墓", description: "에너지가 저장되는 단계. 축적과 준비의 시기" },
  "절": { hanja: "絶", description: "에너지가 끊기는 단계. 완전한 전환의 시기" },
  "태": { hanja: "胎", description: "새 에너지가 잉태되는 단계. 새로운 가능성의 시작" },
  "양": { hanja: "養", description: "에너지가 양육되는 단계. 준비와 성숙의 과정" },
  // 오행
  "목": { hanja: "木", description: "나무의 기운. 성장, 발전, 인자함을 상징" },
  "화": { hanja: "火", description: "불의 기운. 열정, 표현, 예의를 상징" },
  "토": { hanja: "土", description: "흙의 기운. 중심, 안정, 신뢰를 상징" },
  "금": { hanja: "金", description: "금속의 기운. 결단, 정의, 의리를 상징" },
  "수": { hanja: "水", description: "물의 기운. 지혜, 유연, 소통을 상징" },
  // 주요 신살
  "천을귀인": { hanja: "天乙貴人", description: "가장 강력한 귀인. 어려울 때 도움을 주는 사람이 나타남" },
  "도화살": { hanja: "桃花殺", description: "매력과 이성 인연의 에너지. 예술적 감각과 연결" },
  "역마살": { hanja: "驛馬殺", description: "이동과 변화의 에너지. 해외, 출장, 전근과 연결" },
  "화개살": { hanja: "華蓋殺", description: "학문과 종교의 에너지. 예술적 재능과 고독" },
  "양인살": { hanja: "羊刃殺", description: "강한 추진력의 에너지. 과감함과 위험이 공존" },
  "홍염살": { hanja: "紅艶殺", description: "강한 매력과 이성운의 에너지" },
  // 주요 개념
  "일간": { hanja: "日干", description: "일주의 천간. 사주에서 '나 자신'을 대표하는 글자" },
  "용신": { hanja: "用神", description: "사주에서 가장 필요로 하는 오행. 균형의 열쇠" },
  "기신": { hanja: "忌神", description: "사주에서 가장 꺼리는 오행. 용신의 반대" },
  "대운": { hanja: "大運", description: "10년마다 바뀌는 인생의 큰 흐름" },
  "세운": { hanja: "歲運", description: "매년 바뀌는 한 해의 운세. 그 해의 간지와 사주 상호작용" },
  "일주": { hanja: "日柱", description: "생일의 간지. 나의 본질과 배우자궁을 나타냄" },
  "연주": { hanja: "年柱", description: "태어난 해의 간지. 조상과 사회적 환경" },
  "월주": { hanja: "月柱", description: "태어난 달의 간지. 부모와 성장 환경" },
  "시주": { hanja: "時柱", description: "태어난 시간의 간지. 자녀와 말년 운" },
  "천간": { hanja: "天干", description: "하늘의 기운 10개(갑을병정무기경신임계). 드러나는 에너지" },
  "지지": { hanja: "地支", description: "땅의 기운 12개(자축인묘진사오미신유술해). 숨은 에너지" },
  "지장간": { hanja: "支藏干", description: "지지 속에 숨어있는 천간. 내면의 잠재된 에너지" },
};

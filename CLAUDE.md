# 운명사주 (FateSaju) — AI 사주 리포트 서비스

## 프로젝트 개요
명리학 기반 AI 사주 리포트 SaaS. 만세력 엔진(코드)으로 정확한 사주 계산 → Claude API로 전문적 해석 → 트렌디한 UI로 리포트 제공.

## 브랜딩
- 서비스명: 운명사주 (FateSaju)
- 도메인(KR): fatesaju.com
- 도메인(US): k-fate.com (Phase 2)
- 슬로건: "AI가 명리학으로 풀어내는 당신의 운명"

## MVP 범위 (Phase 1: 한국어만)
- 무료: 사주팔자 + 오행 차트 + 성격 요약 3~4문장 + 올해 키워드 1줄
- 유료 풀 리포트: 10개 섹션 상세 분석 (5,900원)
- 유료 궁합: 2인 사주 비교 분석 (7,900원)
- 유료 연간운세: 월별 운세 흐름 (4,900원)
- 올인원 패키지: 풀+궁합+연간 (14,900원)
- 결제: 토스페이먼츠 (카카오페이/토스/카드)

## 기술 스택
- 프레임워크: Next.js 15 (App Router, TypeScript)
- 스타일링: Tailwind CSS + Framer Motion
- 만세력 엔진: lunar-javascript (Node.js) + 커스텀 십성/12운성/신살 로직
- LLM: Claude Sonnet 4.5 (Anthropic API) — 섹션별 병렬 호출
- DB: Supabase (Postgres + Auth)
- 캐시: Vercel KV (Redis)
- 결제: 토스페이먼츠
- 배포: Vercel
- 분석: PostHog 또는 Mixpanel

---

## 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                Frontend (Next.js 15)                 │
│  Landing → Input Form → Loading UX → Report Viewer  │
│  Korean only (Phase 1)                               │
└──────────────────────┬──────────────────────────────┘
                       │ API Routes (/api/*)
┌──────────────────────▼──────────────────────────────┐
│                 Backend (Next.js API)                 │
│                                                      │
│  [만세력 엔진]     [LLM 서비스]      [결제 서비스]   │
│  서버사이드 계산    Claude API         토스페이먼츠   │
│  사주/십성/운성    섹션별 병렬호출     결제/웹훅      │
│  대운/신살/합충    프롬프트 관리       구독관리       │
│  오행/용신        캐싱+에러재시도                    │
│                                                      │
│  [Database: Supabase]  [Cache: Vercel KV]            │
└─────────────────────────────────────────────────────┘
```

---

## 파일 구조

```
fatesaju/
├── CLAUDE.md
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── page.tsx                # 랜딩 페이지
│   │   ├── globals.css
│   │   │
│   │   ├── input/
│   │   │   └── page.tsx            # 생년월일 입력 폼
│   │   │
│   │   ├── report/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # 리포트 뷰어 (무료+유료)
│   │   │   └── loading.tsx         # 로딩 UX
│   │   │
│   │   ├── compatibility/
│   │   │   └── page.tsx            # 궁합 분석
│   │   │
│   │   ├── yearly/
│   │   │   └── page.tsx            # 연간 운세
│   │   │
│   │   ├── pricing/
│   │   │   └── page.tsx            # 가격 페이지
│   │   │
│   │   └── api/
│   │       ├── saju/
│   │       │   ├── calculate/route.ts    # 만세력 계산 API
│   │       │   └── report/route.ts       # LLM 리포트 생성 API
│   │       ├── compatibility/
│   │       │   └── route.ts              # 궁합 API
│   │       ├── payment/
│   │       │   ├── create/route.ts       # 결제 생성
│   │       │   └── webhook/route.ts      # 토스 웹훅
│   │       └── yearly/
│   │           └── route.ts              # 연간운세 API
│   │
│   ├── lib/
│   │   ├── saju/
│   │   │   ├── engine.ts           # 만세력 엔진 메인
│   │   │   ├── cheongan.ts         # 천간 10개 데이터+로직
│   │   │   ├── jiji.ts             # 지지 12개 데이터+로직
│   │   │   ├── sipseong.ts         # 십성 판별
│   │   │   ├── unseong.ts          # 12운성 판별
│   │   │   ├── sinsal.ts           # 신살 판별
│   │   │   ├── oheng.ts            # 오행 분포+상생상극
│   │   │   ├── interactions.ts     # 합충형파해
│   │   │   ├── daeun.ts            # 대운 계산
│   │   │   ├── yongsin.ts          # 용신/기신 추론
│   │   │   ├── calendar.ts         # 음양력 변환 (lunar-javascript 래퍼)
│   │   │   ├── types.ts            # 타입 정의
│   │   │   └── constants.ts        # 상수 (조견표 등)
│   │   │
│   │   ├── llm/
│   │   │   ├── client.ts           # Claude API 클라이언트
│   │   │   ├── prompts.ts          # 섹션별 프롬프트
│   │   │   ├── parallel.ts         # 병렬 호출 + 에러 재시도
│   │   │   └── cache.ts            # 리포트 캐싱
│   │   │
│   │   ├── payment/
│   │   │   └── toss.ts             # 토스페이먼츠 연동
│   │   │
│   │   ├── db/
│   │   │   ├── supabase.ts         # Supabase 클라이언트
│   │   │   └── queries.ts          # DB 쿼리
│   │   │
│   │   └── utils/
│   │       ├── hash.ts             # 사주 해시 생성
│   │       └── format.ts           # 포맷 유틸
│   │
│   ├── components/
│   │   ├── ui/                     # 공통 UI (Button, Card, Modal...)
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── SampleReport.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── FAQ.tsx
│   │   │
│   │   ├── input/
│   │   │   ├── StepForm.tsx        # 스텝 바이 스텝 입력폼
│   │   │   ├── DatePicker.tsx
│   │   │   └── TimePicker.tsx
│   │   │
│   │   ├── loading/
│   │   │   ├── LoadingScreen.tsx   # 로딩 전체 화면
│   │   │   ├── PillarReveal.tsx    # 팔자 카드 플립 애니메이션
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SectionStatus.tsx   # 섹션별 로딩 상태
│   │   │   └── LoadingTips.tsx     # 명리 미니 팁
│   │   │
│   │   ├── report/
│   │   │   ├── ReportView.tsx      # 리포트 메인 뷰
│   │   │   ├── PillarCard.tsx      # 사주팔자 4기둥 카드
│   │   │   ├── OhengChart.tsx      # 오행 밸런스 차트
│   │   │   ├── DaeunTimeline.tsx   # 대운 타임라인 (인터랙티브)
│   │   │   ├── SectionCard.tsx     # 리포트 섹션 카드
│   │   │   ├── TermPopover.tsx     # 명리 용어 해설 팝오버
│   │   │   ├── PaywallBlur.tsx     # 유료 전환 블러 처리
│   │   │   └── ShareCard.tsx       # SNS 공유 카드 생성
│   │   │
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── SEO.tsx
│   │
│   ├── hooks/
│   │   ├── useSajuCalculation.ts
│   │   ├── useReportGeneration.ts
│   │   └── usePayment.ts
│   │
│   └── styles/
│       └── theme.ts                # 컬러 팔레트, 오행 색상
│
├── public/
│   ├── og-image.png                # SNS 공유 이미지
│   └── fonts/
│
└── tests/
    ├── saju/
    │   ├── engine.test.ts          # 만세력 엔진 테스트 (100개+)
    │   ├── sipseong.test.ts
    │   ├── unseong.test.ts
    │   └── daeun.test.ts
    └── llm/
        └── prompts.test.ts
```

---

## 만세력 엔진 상세

### 핵심: LLM은 절대 사주를 계산하지 않는다. 코드가 계산하고 LLM은 해석만 한다.

### 천간(天干) 10개

```typescript
// src/lib/saju/cheongan.ts
interface Cheongan {
  hanja: string;
  hangul: string;
  element: "木" | "火" | "土" | "金" | "水";
  yinYang: "양" | "음";
  nature: string;       // 자연물 비유
  personality: string;  // 성격 키워드
  number: number;       // 0~9
}

// 甲(갑)乙(을)丙(병)丁(정)戊(무)己(기)庚(경)辛(신)壬(임)癸(계)
// 목양 목음 화양 화음 토양 토음 금양 금음 수양 수음
```

### 지지(地支) 12개

```typescript
// src/lib/saju/jiji.ts
interface Jiji {
  hanja: string;
  hangul: string;
  animal: string;         // 띠
  element: "木" | "火" | "土" | "金" | "水";
  yinYang: "양" | "음";
  hours: string;          // 대응 시간대
  jijanggan: string[];    // 지장간 (숨은 천간들)
  number: number;         // 0~11
}

// 子(자)丑(축)寅(인)卯(묘)辰(진)巳(사)午(오)未(미)申(신)酉(유)戌(술)亥(해)
// 지장간은 각 지지 안에 숨어있는 천간. 예: 寅 = [甲, 丙, 戊]
```

### 사주 계산 순서

```
입력: { birthDate, birthTime, gender, calendarType }

[1] 양력↔음력 변환 (lunar-javascript)
[2] 절기 경계 판별 → 정확한 월주 결정
    - 월주는 달력 기준이 아니라 절기 기준
    - 예: 2월 3일생이라도 입춘(2/4) 전이면 전월 월주
[3] 연주(年柱): 연간(천간) + 연지(지지)
    - 연간 = (year - 4) % 10 → 천간 인덱스
    - 연지 = (year - 4) % 12 → 지지 인덱스
[4] 월주(月柱): 절기 기준 월 + 연간에 따른 월간 결정
    - 월간은 연간×2 + 월 공식 (갑기합토 규칙)
[5] 일주(日柱): 만세력 공식으로 일진 계산
    - lunar-javascript의 일주 데이터 활용
[6] 시주(時柱): 태어난 시간 → 지지 결정 + 일간 기준 시간 결정
    - 자시(23:00~01:00) 초자시 기준
    - 시간은 일간×2 + 시지 공식

[7] 십성 계산: 일간 기준으로 나머지 7글자 + 지장간 전부의 십성 판별
[8] 12운성 계산: 일간이 각 지지에서의 에너지 단계
[9] 지장간 추출: 각 지지의 숨은 천간
[10] 오행 분포: 8글자(천간4+지지4) + 지장간의 오행 집계
[11] 합충형파해: 지지 간 육합/삼합/방합/충/형/파/해 판별
[12] 신살: 천을귀인, 도화살, 역마살, 화개살, 양인살, 홍염살 등
[13] 용신/기신: 일간 강약 판단 → 필요한 오행 결정
[14] 대운: 성별+연간 음양 → 순행/역행 → 10년 단위 간지 시퀀스
[15] 세운: 올해(2026) 간지와 사주 상호작용
```

### 십성 판별 로직

```typescript
// src/lib/saju/sipseong.ts
// 일간의 오행과 대상의 오행 비교 + 음양 비교

function getSipseong(dayGan: string, targetGan: string): string {
  // 같은 오행 + 같은 음양 = 비견
  // 같은 오행 + 다른 음양 = 겁재
  // 내가 생하는 + 같은 음양 = 식신
  // 내가 생하는 + 다른 음양 = 상관
  // 내가 극하는 + 같은 음양 = 편재
  // 내가 극하는 + 다른 음양 = 정재
  // 나를 극하는 + 같은 음양 = 편관(칠살)
  // 나를 극하는 + 다른 음양 = 정관
  // 나를 생하는 + 같은 음양 = 편인
  // 나를 생하는 + 다른 음양 = 정인
}
```

### 12운성 조견표

```typescript
// src/lib/saju/unseong.ts
// 일간 × 지지 → 12운성 (장생/목욕/관대/건록/제왕/쇠/병/사/묘/절/태/양)

const UNSEONG_TABLE: Record<string, string[]> = {
  "甲": ["목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양","장생"],
  // ... 나머지 9개 천간
};
```

### 신살 판별

```typescript
// src/lib/saju/sinsal.ts
// 주요 신살: 천을귀인, 문창귀인, 천덕귀인, 월덕귀인, 금여록,
//           도화살, 역마살, 화개살, 겁살, 망신살, 양인살, 홍염살

// 천을귀인 조견표 (일간 기준)
const CHEONUL: Record<string, string[]> = {
  "甲": ["丑","未"], "乙": ["子","申"], "丙": ["亥","酉"],
  "丁": ["亥","酉"], "戊": ["丑","未"], "己": ["子","申"],
  "庚": ["丑","未"], "辛": ["寅","午"], "壬": ["卯","巳"],
  "癸": ["卯","巳"],
};

// 도화살 조견표 (일지/연지 기준)
const DOHWA: Record<string, string> = {
  "子":"酉", "丑":"午", "寅":"卯", "卯":"子",
  "辰":"酉", "巳":"午", "午":"卯", "未":"子",
  "申":"酉", "酉":"午", "戌":"卯", "亥":"子",
};
```

### 합충형파해

```typescript
// src/lib/saju/interactions.ts

// 육합 (6쌍)
const YUKHAP = [["子","丑"],["寅","亥"],["卯","戌"],["辰","酉"],["巳","申"],["午","未"]];

// 삼합 (4조)
const SAMHAP = [["寅","午","戌"],["申","子","辰"],["巳","酉","丑"],["亥","卯","未"]];

// 충 (6쌍)
const CHUNG = [["子","午"],["丑","未"],["寅","申"],["卯","酉"],["辰","戌"],["巳","亥"]];

// 형/파/해도 유사하게 정의
```

### 엔진 출력 (SajuResult)

만세력 엔진의 최종 출력. 이 JSON이 Claude API에 전달됨.

```typescript
// src/lib/saju/types.ts
interface SajuResult {
  input: { name, birthDate, birthTime, gender, calendarType };
  lunar: { year, month, day, isLeapMonth };
  jeolgi: { name, date, isBeforeJeolgi };

  pillars: {
    year:  { gan, ji, ganInfo, jiInfo };
    month: { gan, ji, ganInfo, jiInfo };
    day:   { gan, ji, ganInfo, jiInfo };
    hour:  { gan, ji, ganInfo, jiInfo };
  };

  dayMaster: { gan, element, yinYang, nature, isStrong, strengthReason };

  sipseong: {
    // 8글자 각각의 십성 + 지장간 십성
    distribution: Record<string, number>;
    dominant: string;
    missing: string[];
  };

  unseong: {
    yearJi, monthJi, dayJi, hourJi;
    dominantStage: string;
  };

  oheng: {
    distribution: { 木, 火, 土, 金, 水 각각 count + percentage };
    strongest, weakest, missing;
    balance: string;
  };

  yongsin: {
    yongsin: Element;    // 용신
    gisin: Element;      // 기신
    heesin: Element;     // 희신
    luckyColors, luckyDirections, luckyNumbers;
  };

  interactions: {
    haps: []; chungs: []; hyeongs: [];
  };

  sinsals: [{ name, type, location, meaning }];

  daeun: [{ startAge, ganji, period, sipseong, unseong, isCurrentDaeun }];

  seun: { year: 2026, ganJi, element, sipseong, keywords };

  jijanggan: { yearJi, monthJi, dayJi, hourJi };
}
```

---

## LLM (Claude API) 연동

### 시스템 프롬프트

```
당신은 한국 명리학(사주팔자) 전문 해석가입니다.

핵심 규칙:
1. 제공되는 사주 데이터는 만세력 엔진으로 정확히 계산된 결과입니다.
   계산을 수정하거나 다시 하지 마세요.
2. 명리학 전문 용어를 적극 사용하되, 괄호 안에 쉬운 설명을 덧붙이세요.
   예: "편관(偏官, 외부에서 오는 도전과 압박의 에너지)이 시주에 자리하여..."
3. 문체: 존댓말. 따뜻하면서도 분석적. 근거는 사주 데이터를 직접 인용.
4. 구조: 근거(왜) → 패턴(어떻게 나타남) → 리스크(주의) → 실행 팁(구체적 행동)
5. 금지: 의료 진단, 법률 조언, 투자 추천, 공포 조장, 단정적 표현.
6. 반복 금지. 간결하고 밀도 있게.
```

### 섹션별 병렬 호출 (10개 동시)

```typescript
// src/lib/llm/parallel.ts

const SECTIONS = [
  "personality",  // 성격·기질
  "career",       // 직업·적성
  "love",         // 연애·결혼
  "wealth",       // 금전·재물
  "health",       // 건강
  "family",       // 가족·배우자
  "past",         // 과거 (초년운)
  "present",      // 현재
  "future",       // 미래 전망
  "timeline",     // 대운 타임라인
];

async function generateReport(sajuResult: SajuResult): Promise<ReportResult> {
  // 10개 섹션 병렬 호출
  const promises = SECTIONS.map(section =>
    generateSection(sajuResult, section)
  );

  // 완료되는 순서대로 콜백 (프로그레시브 UI용)
  const results = await Promise.allSettled(promises);

  // 실패한 섹션만 재시도 (최대 2회)
  for (const [i, result] of results.entries()) {
    if (result.status === "rejected") {
      results[i] = await retry(() => generateSection(sajuResult, SECTIONS[i]), 2);
    }
  }

  return assembleReport(results);
}
```

### 각 섹션 프롬프트 예시

```typescript
// src/lib/llm/prompts.ts

function getPrompt(section: string, sajuResult: SajuResult): string {
  const base = `다음 사주 데이터를 바탕으로 [${SECTION_TITLES[section]}] 섹션을 작성하세요.

사주 데이터:
${JSON.stringify(sajuResult, null, 2)}

공통 요구사항:
- 800~1,500자
- 근거 → 패턴 → 리스크 → 실행 팁 흐름
- 명리 용어 + 쉬운 설명 병기
- 실행 팁에 구체적 행동 1개 이상

출력 형식 (JSON만):
{"title":"...","text":"본문","keywords":["..."],"highlights":["핵심문장"]}`;

  // 섹션별 추가 지시
  const extras: Record<string, string> = {
    personality: "① 일간의 본질 성격 ② 월주 십성의 사회적 성격 ③ 시주의 내면 ④ 12운성 에너지 ⑤ 오행 균형 영향 ⑥ 신살 영향 ⑦ 장점3+주의점2",
    career: "① 식상(재능 표현)과 관성(직업) 배치 ② 적합 직업 분야 3개 ③ 대운별 커리어 전환 시기 ④ 올해 직업운",
    love: "① 일지(배우자궁) 분석 ② 재성/관성의 연애 패턴 ③ 도화살/홍염살 영향 ④ 결혼 적기 ⑤ 배우자 성향 예측",
    wealth: "① 정재/편재 강약 ② 재물 들어오는 시기/방향 ③ 투자vs저축 성향 ④ 대운별 재물운 흐름",
    health: "① 약한 오행→대응 장부 ② 주의 시기 ③ 건강 보완 방향 (색상/방위/음식 등) ④ 의료 단정 금지",
    family: "① 연주(조상/사회) ② 월주(부모/성장기) ③ 일주(배우자) ④ 시주(자녀/말년) ⑤ 육친 관계 패턴",
    past: "① 연주+월주로 본 초년운 ② 지나온 대운 흐름 ③ 과거 경험이 현재에 미치는 영향",
    present: "① 현재 대운 분석 ② 올해(2026) 세운과 사주 상호작용 ③ 올해 핵심 키워드 ④ 지금 집중해야 할 것",
    future: "① 다가오는 대운 변화 ② 향후 10년 핵심 전환점 ③ 준비해야 할 것",
    timeline: "① 전체 대운 흐름 요약 (10년 단위) ② 각 대운의 핵심 키워드와 에너지 레벨 ③ 인생 전체 로드맵",
  };

  return base + "\n\n추가 요구사항:\n" + extras[section];
}
```

### 캐싱

```typescript
// src/lib/llm/cache.ts
// 같은 생년월일+시간+성별 = 같은 사주 = 같은 리포트
// 캐시 키: SHA256(birthDate + birthTime + gender + section)
// 저장: Vercel KV
// 캐시 히트 시 LLM 비용 0, 응답 즉시
```

---

## 로딩 UX

### Phase 1: 만세력 계산 (~2초 연출)

사주 계산은 즉시 끝나지만 애니메이션을 위해 단계별 표시:

```
"생년월일시를 확인하고 있습니다..." (0.8초)
→ "음력으로 변환하고 있습니다..." (0.8초)
→ "절기를 확인하고 있습니다..." (0.8초)
→ "사주팔자를 세우고 있습니다..." (팔자 카드 플립 애니메이션)
```

**팔자 카드 플립:**
```
[?][?][?][?] → [壬申][?][?][?] → [壬申][丁未][?][?] → [壬申][丁未][甲辰][?] → [壬申][丁未][甲辰][壬戌]
연주 → 월주 → 일주 → 시주 순서로 400ms 간격 플립
```

### Phase 2: 병렬 LLM 호출 (~5-8초)

10개 섹션 동시 요청. 완료 순서대로 화면에 추가.

각 섹션 로딩 메시지 (명리학 용어 포함):
```typescript
const LOADING_MESSAGES = {
  personality: [
    "일간의 성정을 읽고 있습니다...",
    "십성 배치에서 성격 패턴을 분석하고 있습니다...",
    "12운성으로 에너지 흐름을 파악하고 있습니다...",
  ],
  career: [
    "관성(官星)과 식상(食傷)의 배치를 분석하고 있습니다...",
    "직업 적성과 재능의 방향을 읽고 있습니다...",
  ],
  love: [
    "일지(日支)에서 배우자 궁을 읽고 있습니다...",
    "도화살과 홍염살 여부를 확인하고 있습니다...",
  ],
  wealth: [
    "재성(財星)의 강약을 측정하고 있습니다...",
    "재물이 들어오는 시기와 방향을 확인하고 있습니다...",
  ],
  health: [
    "오행의 과불급을 분석하고 있습니다...",
    "약한 오행에 연결된 장부를 확인하고 있습니다...",
  ],
  family: [
    "사주 각 기둥의 육친 관계를 분석하고 있습니다...",
    "부모궁, 형제궁, 자녀궁을 읽고 있습니다...",
  ],
  past: [
    "연주와 월주에서 초년운을 읽고 있습니다...",
  ],
  present: [
    "현재 대운과 세운의 조합을 분석하고 있습니다...",
  ],
  future: [
    "다가오는 대운의 변화를 예측하고 있습니다...",
    "인생의 전환점이 될 시기를 찾고 있습니다...",
  ],
  timeline: [
    "전체 대운의 흐름을 정리하고 있습니다...",
    "인생 로드맵을 완성하고 있습니다...",
  ],
};
```

**로딩 중 미니 팁 (하단 5초마다 로테이션):**
```typescript
const TIPS = [
  "💡 사주의 '日干(일간)'은 나 자신을 의미합니다. 나머지 7글자는 나를 둘러싼 환경이에요.",
  "💡 '대운'은 10년마다 바뀌는 인생의 큰 흐름입니다.",
  "💡 오행(五行)은 목·화·토·금·수 다섯 가지 에너지의 균형입니다.",
  "💡 '십성(十星)'은 일간과 다른 글자의 관계를 나타냅니다.",
  "💡 사주는 운명의 결정이 아니라 타고난 에너지 패턴의 지도입니다.",
  "💡 '용신(用神)'은 사주에서 가장 필요한 오행입니다.",
  "💡 연주는 조상, 월주는 부모, 일주는 나, 시주는 자녀를 봅니다.",
];
```

**프로그레시브 표시:**
- 첫 섹션 완료 시 → 로딩 전체화면에서 리포트 뷰로 전환
- 완성된 섹션: 텍스트 표시 (opacity 0→1, translateY 20→0 애니메이션)
- 로딩 중 섹션: 스켈레톤 + 해당 섹션 로딩 메시지
- 대기 중 섹션: 회색 제목만 표시
- 하단 고정: 프로그레스 바 (████████░░ 68% | 7/10 완료)

---

## 디자인 시스템

### 컬러 팔레트

```typescript
// src/styles/theme.ts
const colors = {
  // 기본
  primary:    "#1A1147",  // Deep Indigo (밤하늘)
  secondary:  "#6C3CE1",  // Purple (신비)
  accent:     "#D4A84B",  // Gold (고급, 동양적)
  background: "#0D0B1A",  // Almost Black
  surface:    "#1E1A3A",  // Card Background
  text:       "#E8E4F0",  // Light Lavender
  textMuted:  "#8B85A0",  // Muted
  success:    "#2ECC71",

  // 오행 컬러
  oheng: {
    "木": "#4CAF50",
    "火": "#F44336",
    "土": "#FFC107",
    "金": "#9E9E9E",
    "水": "#2196F3",
  },
};
```

### 타이포그래피

```
제목: Pretendard Bold
명리 한자: Noto Serif KR (한자 표시용)
본문: Pretendard Regular
```

### 핵심 컴포넌트

**PillarCard (사주 4기둥):**
- 천간(위) + 지지(아래)
- 한자 큰 서체 + 한글 발음 작게
- 일간(일주 천간) 골드 하이라이트
- 호버/탭: 십성 + 12운성 팝오버

**OhengChart (오행 차트):**
- 레이더 차트 또는 수평 바 차트 (Recharts)
- 오행별 컬러 적용
- 카운트업 애니메이션 (0 → 실제값)

**DaeunTimeline (대운 타임라인):**
- 가로 스크롤 타임라인
- 현재 대운 하이라이트
- 클릭 시 해당 대운 상세 펼침
- 에너지 레벨 바

**TermPopover (명리 용어 해설):**
- 리포트 텍스트 내 명리 용어에 밑줄
- 호버/탭 시 해설 팝오버 (용어 + 한자 + 쉬운 설명)
- 킬러 피처: 전문성 + 교육적 가치

**PaywallBlur (유료 전환):**
- 무료: 첫 2문장 보이고 나머지 블러
- "전체 분석 보기 →" CTA 버튼
- 블러가 서서히 걷히는 애니메이션 (결제 후)

### 반응형

```
Mobile:  < 640px  (1열, 풀너비, 터치 최적화)
Tablet:  640~1024px (2열)
Desktop: > 1024px (사이드네비 + 메인)
```

### 인터랙션/애니메이션 (Framer Motion)

```
1. 팔자 카드: 뒤집히며 등장 (rotateY 180→0)
2. 오행 차트: 0→실제값 카운트업
3. 대운 타임라인: 좌우 스와이프/스크롤
4. 섹션 등장: opacity 0→1, translateY 20→0
5. 유료 전환: 블러 걷히는 효과 (blur 10→0)
6. 로딩: 텍스트 타이핑 효과
```

---

## DB 스키마 (Supabase)

```sql
-- 사용자
create table users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz default now()
);

-- 리포트
create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  saju_hash text not null,
  input_json jsonb not null,
  saju_result jsonb not null,
  report_json jsonb,
  report_type text not null,  -- 'full' | 'compatibility' | 'yearly'
  tier text not null,          -- 'free' | 'premium'
  created_at timestamptz default now()
);

-- 결제
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  report_id uuid references reports(id),
  amount integer not null,
  currency text default 'KRW',
  provider text default 'toss',
  status text not null,
  payment_key text,
  paid_at timestamptz
);

-- 캐시
create table report_cache (
  saju_hash text not null,
  section_key text not null,
  content jsonb not null,
  created_at timestamptz default now(),
  primary key (saju_hash, section_key)
);
```

---

## .env.local

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 토스페이먼츠
TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# Vercel KV
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# 기타
NEXT_PUBLIC_SITE_URL=https://fatesaju.com
```

---

## 개발 순서 (Claude Code에 이 순서대로 지시)

### Step 1: 프로젝트 초기화
```
Next.js 15 + TypeScript + Tailwind + Framer Motion 프로젝트 생성
폴더 구조 세팅
```

### Step 2: 만세력 엔진 (가장 중요)
```
lunar-javascript 설치
천간/지지/십성/12운성/신살/합충/오행/용신/대운 전체 구현
테스트 케이스 최소 20개 (알려진 유명인 사주로 검증)
```

### Step 3: LLM 연동
```
Claude API 클라이언트
섹션별 프롬프트
병렬 호출 + 에러 재시도
캐싱 로직
```

### Step 4: 프론트엔드 — 입력 + 로딩
```
랜딩 페이지 (Hero + HowItWorks + Pricing)
스텝 바이 스텝 입력폼
로딩 화면 (팔자 플립 + 프로그레시브)
```

### Step 5: 프론트엔드 — 리포트
```
리포트 뷰어
팔자 카드 / 오행 차트 / 대운 타임라인
명리 용어 팝오버
무료 블러 + 유료 전환
```

### Step 6: 결제
```
토스페이먼츠 연동
결제 플로우 (생성→승인→웹훅)
```

### Step 7: DB + 배포
```
Supabase 스키마 생성
Vercel 배포
도메인 연결 (fatesaju.com)
SEO 메타태그
```

### Step 8: 궁합 + 연간운세
```
궁합 분석 (2인 사주 비교)
연간 운세 (2026 세운)
```

---

## SEO (한국 핵심)

```
타겟 키워드:
  "무료 사주" — 월 110,000 검색
  "사주 보기" — 월 74,000
  "사주팔자 풀이" — 월 33,000
  "무료 궁합" — 월 49,000

메타 타이틀: "운명사주 | AI 사주팔자 무료 분석 — 명리학 기반 정밀 리포트"
메타 설명: "생년월일시만 입력하면 AI가 명리학으로 성격, 직업, 연애, 재물운을 분석합니다. 무료 사주 보기."
```

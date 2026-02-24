# FateSaju 작업 로그 (AI Handoff Document)

> **최종 갱신:** 2026-02-24
> **갱신자:** Claude Opus 4.6
> **브랜치:** main
> **최신 커밋:** `90948d2` feat: landing page redesign — Soft Lavender dark theme
> **빌드 상태:** PASS (Next.js 16.1.6, Turbopack)
> **테스트:** 392/392 통과 (16 suites, ~500ms)
> **배포:** https://fatesaju.vercel.app (Vercel 프로덕션)

---

## 1. 프로젝트 개요

**운명사주 (FateSaju)** — 명리학 기반 AI 사주 리포트 SaaS.

핵심 원칙: **만세력 엔진(코드)이 사주를 계산하고, Claude API(LLM)는 해석만 한다.**

- 기획서: `CLAUDE.md` (전체 스펙, 아키텍처, 프롬프트 등)
- 아키텍처 문서: `docs/STATUS.md` (API 스펙, DB 스키마, 테스트 전략)
- DB 스키마: `docs/db.sql`

### 기술 스택
| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS v4 + Framer Motion |
| 만세력 엔진 | lunar-javascript + 커스텀 로직 16개 모듈 |
| LLM | Claude Sonnet 4.5 (Anthropic API), 섹션별 병렬 호출 |
| DB | Supabase (Postgres + Auth + RLS) |
| 결제 | 토스페이먼츠 |
| 배포 | Vercel |
| 테스트 | Vitest |

---

## 2. 구현 완료 항목

### 만세력 엔진 (src/lib/saju/) — 16개 모듈
- [x] `engine.ts` — 메인 오케스트레이터 `calculateSaju()`
- [x] `types.ts` — 전체 타입 정의 (SajuResult, Pillar, Cheongan, Jiji 등)
- [x] `constants.ts` — 천간 10개, 지지 12개, 12운성 조견표, 오행 상생상극
- [x] `calendar.ts` — lunar-javascript 래퍼 (음양력 변환, 절기, 4기둥)
- [x] `sipseong.ts` — 십성 판별 (비견/겁재/식신/상관/편재/정재/편관/정관/편인/정인)
- [x] `unseong.ts` — 12운성 조견표 (장생→양 사이클)
- [x] `oheng.ts` — 오행 분포 (천간 1.0, 지지 1.0, 지장간 가중치)
- [x] `interactions.ts` — 합충형파해 (지지: 육합/삼합/방합/충/형/파/해 + 천간합/충)
- [x] `sinsal.ts` — 9종 신살 (천을귀인, 문창귀인, 도화살, 역마살, 화개살, 양인살, 홍염살, 겁살, 망신살)
- [x] `daeun.ts` — 대운 계산 (10년 단위, 순행/역행)
- [x] `yongsin.ts` — 용신/기신/희신 (억부 > 조후 > 통관 우선순위, rationale 포함)
- [x] `geokguk.ts` — 격국 판별 (10종)
- [x] `timeBranch.ts` — 시주 지지 라벨 (23:00~01:00 초자시 포함)
- [x] `interpretations.ts` — 사주 해석 헬퍼

### LLM 연동 (src/lib/llm/) — 4개 모듈
- [x] `client.ts` — Claude API 클라이언트 (fetch 기반, 재시도)
- [x] `parallel.ts` — 10섹션 병렬 호출, usage 추적, placeholder 모드
- [x] `prompts.ts` — 시스템 프롬프트 + 섹션별 프롬프트 (금지어 16개)
- [x] `cache.ts` — 2계층 캐시 (Memory Map → Supabase report_cache)

### 프론트엔드 — 12+ 페이지
- [x] `/` — 랜딩 (Hero, Features, Pricing, FAQ) — Soft Lavender 테마
- [x] `/input` — 생년월일 입력 (스텝바이스텝 DatePicker, 시간, 성별, 역법)
- [x] `/report/new` — 리포트 생성 로딩 (팔자 카드 플립 + 프로그레시브)
- [x] `/report/[id]` — 리포트 뷰어 (PillarCard, OhengChart, DaeunTimeline, SectionCard, PaywallCTA)
- [x] `/compatibility` — 궁합 입력
- [x] `/compatibility/result` — 궁합 결과 (점수 원형 차트, 장단점)
- [x] `/yearly` — 연간운세 입력
- [x] `/yearly/result` — 연간운세 결과 (월별 에너지 바, 전환점)
- [x] `/pricing` — 가격 페이지 (무료/풀/올인원)
- [x] `/auth/login` — 매직 링크 로그인
- [x] `/log` — 운영 대시보드 (로그인 게이트)

### 컴포넌트 (src/components/) — 16+ 개
- [x] PillarCard, OhengChart, DaeunTimeline, SectionCard, TermPopover, PaywallCTA, ShareCard
- [x] LoadingScreen (팔자 플립 + 섹션 프로그레시브)
- [x] DateInput (달력 팝업)
- [x] Header, Footer, ErrorFallback, GoogleAnalytics
- [x] Button (공통 UI)
- [x] OpsLoginForm (운영 대시보드용)

### API 라우트 — 12개
- [x] `POST /api/saju/calculate` — 만세력 계산
- [x] `POST /api/saju/report` — 리포트 생성 (free/premium)
- [x] `GET /api/saju/report/[id]` — 저장된 리포트 조회
- [x] `POST /api/compatibility` — 궁합 분석
- [x] `POST /api/yearly` — 연간운세 분석
- [x] `POST /api/payment/create` — 토스 결제 의도 생성
- [x] `GET /api/payment/confirm` — 결제 확인 + 티어 업그레이드
- [x] `POST /api/payment/webhook` — 토스 웹훅 (취소 처리 미구현)
- [x] `GET /auth/callback` — Supabase auth 콜백
- [x] 운영 API 4개 (login, logout, events, stats)

### 인프라/기타
- [x] Supabase 스키마 (`docs/db.sql`) — profiles, reports, payments, report_cache + RLS
- [x] i18n (한국어 사전)
- [x] Rate Limiting
- [x] Ops 로깅 (구조화 로그 + IP 해싱)
- [x] GA4 연동 준비
- [x] Vercel 배포 (프로덕션)
- [x] 디자인 토큰 시스템 (`src/styles/theme.ts`)

### 테스트 — 392개 전체 통과
| 테스트 파일 | 수 | 커버리지 |
|-------------|-----|----------|
| engine-golden.test.ts | 139 | 골든 벡터 (유명인/경계 케이스) |
| timeBranch.test.ts | 55 | 시주 지지 엣지 케이스 |
| engine.test.ts | 54 | 엔진 통합 |
| DateInput.test.ts | 28 | 달력 컴포넌트 |
| sipseong.test.ts | 25 | 십성 로직 |
| i18n/dictionary.test.ts | 24 | 한국어 사전 완전성 |
| llm/parallel.test.ts | 17 | 병렬 생성, 비용 계산 |
| utils/hash.test.ts | 8 | SHA-256 해시 |
| opsLogger.test.ts | 7 | 운영 로깅 |
| interpretations.test.ts | 6 | 사주 해석 |
| ipHash.test.ts | 6 | IP 해싱 |
| format.test.ts | 5 | 포맷 유틸 |
| toss.test.ts | 5 | 결제 가격 |
| calculate.test.ts | 5 | 계산 API |
| cache.test.ts | 4 | LLM 캐시 |
| ratelimit/limiter.test.ts | 4 | Rate Limiting |

---

## 3. 미구현 / TODO 항목

### 코드 내 TODO (2개)
| 위치 | 내용 | 우선순위 |
|------|------|----------|
| `src/app/api/payment/webhook/route.ts` | 결제 취소 시 리포트 티어 되돌리기 | Medium |
| `src/app/report/[id]/page.tsx` | TossPayments SDK 위젯 통합 (현재 redirect 방식) | Low |

### 외부 서비스 설정 (사용자 필요)
| 항목 | 상태 | 설명 |
|------|------|------|
| `.env.local` 환경변수 | **미완료** | Anthropic, Supabase, Toss 키 설정 필요 |
| Supabase DB 스키마 실행 | **미완료** | `docs/db.sql`을 SQL Editor에서 실행 |
| Vercel 환경변수 설정 | **미완료** | 프로덕션 환경변수 입력 |
| 커스텀 도메인 연결 | **미완료** | `fatesaju.com` → Vercel |
| Toss Payments 실서비스 키 | **미완료** | 테스트 키 → 라이브 키 전환 |
| KV (Redis) 연결 | **선택** | Vercel KV 프로젝트 연결 |
| GA4 설정 | **선택** | `GA_MEASUREMENT_ID` 환경변수 |

### Phase 2 로드맵 (미착수)
| 항목 | 설명 |
|------|------|
| 영문 시장 | k-fate.com 도메인, 영어 i18n, US 결제 |
| 카카오톡 공유 | 공유 카드 이미지 생성 + 카카오 SDK |
| PostHog/Mixpanel | 사용자 행동 분석 |
| 사용자 대시보드 | 과거 리포트 목록, 결제 내역 |
| SEO 블로그 콘텐츠 | 무료 사주 키워드 유입용 |
| 결제 위젯 | Toss SDK 임베디드 모달 |
| 구독 모델 | 월정액/연정액 옵션 |

---

## 4. 코드 품질 이슈 (알려진 것)

### Minor Issues
| 파일 | 이슈 | 심각도 |
|------|------|--------|
| `.env.example` | `LLM_CACHE_WRITE_PRICE_PER_M`, `LLM_CACHE_READ_PRICE_PER_M` 누락 | Low |
| `src/app/layout.tsx:53` | `url: "https://fatesaju.com"` 하드코딩 (env 사용 권장) | Low |
| 결제 웹훅 | 취소 시 tier 되돌리기 미구현 | Medium |

### 설계 메모
- `ANTHROPIC_API_KEY` 미설정 시 → `generatePlaceholderReport()` 폴백 (LLM 호출 없음)
- Compatibility/Yearly 결과는 `sessionStorage`에 저장 (DB 저장 없음 - 결제 시 전환 필요)
- `localhost:3000` fallback URL은 개발 환경용으로 적절함

---

## 5. 핵심 파일 위치 가이드

```
CLAUDE.md                          ← 전체 기획서 + 프롬프트 + 스펙
WORK_LOG.md                        ← 이 문서 (AI 작업 로그)
docs/STATUS.md                     ← API 스펙, DB 스키마, 상세 아키텍처
docs/db.sql                        ← Supabase SQL (profiles, reports, payments, report_cache + RLS)

src/lib/saju/engine.ts             ← 만세력 엔진 메인 (calculateSaju)
src/lib/saju/types.ts              ← 모든 타입 정의 (SajuResult, Pillar, etc.)
src/lib/saju/constants.ts          ← 천간/지지 데이터, 조견표
src/lib/llm/parallel.ts            ← LLM 병렬 호출 + usage 추적
src/lib/llm/prompts.ts             ← 시스템/섹션 프롬프트
src/styles/theme.ts                ← 디자인 토큰 (colors.oheng 등)

src/app/page.tsx                   ← 랜딩 페이지
src/app/input/page.tsx             ← 입력 폼
src/app/report/[id]/page.tsx       ← 리포트 뷰어
src/app/api/saju/report/route.ts   ← 리포트 생성 API (핵심)

tests/saju/engine-golden.test.ts   ← 139개 골든 테스트
vitest.config.ts                   ← 테스트 설정
```

---

## 6. 커밋 히스토리 (최신순)

| 해시 | 설명 | 날짜 |
|------|------|------|
| `90948d2` | 랜딩 페이지 리디자인 — Soft Lavender 다크 테마 | 최신 |
| `2272b5b` | 운영 대시보드 `/log` — 구조화 로깅, LLM 비용 추적 | |
| `e3a7878` | LLM 비용 최적화 — 프롬프트 압축 + Prompt Caching | |
| `3741f52` | P0 패널 리뷰 — 익명 접근, GA4, Rate Limiting | |
| `525c379` | 프로젝트 상태 + 아키텍처 문서 | |
| `688b2d1` | 사주 엔진 고도화 — 격국/천간합충/파해/용신/139 골든 테스트 | |
| `251eb04` | Free/Premium 티어 로직, LLM usage 추적 | |
| `7c65f50` | 한국 시지(時支) 라벨 표시 | |
| `484f065` | 스텝바이스텝 DatePicker, i18n, 디자인 팔레트 | |
| `d2566d9` | 달력 팝업 DatePicker | |
| `5b9bd51` | 날짜 입력 버그 수정 + 프리미엄 디자인 | |
| `9faa775` | 디자인 토큰 시스템 리팩토링 | |
| `4c44453` | compatibility result TypeScript 타입 에러 수정 | |
| `0d16eb9` | 궁합 + 연간운세 (Step 8) | |
| `673724b` | Supabase DB 스키마 (Step 7) | |
| `1d57c6d` | 프론트엔드 컴포넌트 + 훅 (Step 4-5) | |
| `6c01367` | LLM 연동 모듈 (Step 3) | |
| `8a13bef` | E2E 통합 — auth, payment, report delivery | |
| `1a8d7ba` | 만세력 엔진 구현 (Step 2) — 79 테스트 | |
| `2893c36` | 프로젝트 초기화 (Step 1) | |
| `0c18361` | Initial commit from Create Next App | |

---

## 7. AI 작업 지침

### 필수 규칙
1. **사주 계산은 코드만** — LLM에 사주 계산을 시키지 않는다.
2. **테스트 유지** — 변경 후 `npx vitest run`으로 392개 전체 통과 확인.
3. **타입 안전성** — `src/lib/saju/types.ts`의 인터페이스 변경 시 연관 파일 전부 확인.
4. **디자인 토큰** — 하드코딩 색상 대신 `src/styles/theme.ts`의 `colors` 객체 사용.
5. **커밋 규칙** — 작업 완료마다 자세한 한글 커밋 메시지 + `git push origin main`.

### 작업 시 체크리스트
```
1. 이 문서(WORK_LOG.md) 읽기
2. CLAUDE.md (기획서) 참고
3. 변경 전: git status 확인
4. 변경 후: npx vitest run (392 통과 확인)
5. 변경 후: npx next build (빌드 통과 확인)
6. 커밋 + 푸시
7. 이 문서 갱신 (최신 커밋, 변경사항 반영)
```

### 주의사항
- `types.ts`에 `StrengthScoring`, `GeokGuk`, `UsageStats` 등 최근 추가 필드 있음 — 엔진/API 코드와 동기화 필수.
- `PillarCard.tsx`는 `colors`를 `@/styles/theme`에서 import — 하드코딩 색상 변환 완료.
- `interactions` 필드에 `pas`, `haes`, `cheonganHaps`, `cheonganChungs` 추가됨.
- `DaeunEntry`에 `element`, `ganElement`, `jiElement` 추가됨.
- `SeunResult`에 `jiSipseong`, `natalInteractions` 추가됨.

---

## 8. 환경변수 전체 목록

```env
# 필수 (LLM)
ANTHROPIC_API_KEY=sk-ant-...

# 필수 (DB)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 필수 (결제)
TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# 선택 (캐시)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# 선택 (공유)
NEXT_PUBLIC_KAKAO_JS_KEY=...

# 선택 (분석)
GA_MEASUREMENT_ID=G-...

# 선택 (비용 추적)
LLM_INPUT_PRICE_PER_M=3
LLM_OUTPUT_PRICE_PER_M=15
LLM_CACHE_WRITE_PRICE_PER_M=3.75
LLM_CACHE_READ_PRICE_PER_M=0.30

# 선택 (사이트)
NEXT_PUBLIC_SITE_URL=https://fatesaju.com

# 선택 (운영)
OPS_IP_SALT=fatesaju-default-salt
OPS_PASSWORD=...
```

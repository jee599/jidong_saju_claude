# Task: 랜딩페이지 Soft Lavender 다크 테마 리디자인

Source: user message 2026-02-24

---

# Task: 랜딩페이지 Soft Lavender 다크 테마 리디자인

> 목적: 현재 src/app/page.tsx 랜딩페이지를 아래 디자인 시스템으로 전면 교체
> 변경 범위: src/app/page.tsx, src/app/globals.css, src/styles/theme.ts, tailwind.config.ts
> 결과물: 다크 테마, 라벤더 액센트, 부드러운 애니메이션이 적용된 프로페셔널 랜딩
> 참고 HTML: 이 문서 하단의 디자인 스펙이 정확한 기준. 그대로 Next.js/Tailwind로 옮길 것.

-----

## 디자인 시스템 — Color Tokens

/* globals.css 또는 tailwind.config.ts에 적용 */

:root {
  --bg: #0A0810; /* 메인 배경 — 거의 검정에 보라 틴트 */
  --bg-s: #0E0C18; /* 섹션 교차 배경 (Features, Reviews) */
  --bg-card: #141220; /* 카드 배경 */
  --bg-card-h: #1A1730; /* 카드 호버 */
  --t1: #EEEAF8; /* 메인 텍스트 — 순백이 아닌 라벤더 화이트 */
  --t2: #9E96B8; /* 서브 텍스트 */
  --t3: #6A6284; /* 비활성 텍스트 */
  --lav: #9B7FE6; /* 메인 액센트 — Pure Lavender */
  --lav-l: #BCA8F5; /* 라벤더 라이트 */
  --lav-p: #D8CCF9; /* 라벤더 페일 (그라데이션 끝) */
  --lav-d: #7558CC; /* 라벤더 다크 (그라데이션 시작) */
  --lav-dim: rgba(155,127,230,0.11); /* 라벤더 배경 틴트 */
  --lav-glow: rgba(155,127,230,0.22); /* 라벤더 글로우 */
  --g: #5CC98A; /* 무료 뱃지 그린 */
  --g-dim: rgba(92,201,138,0.11); /* 그린 배경 틴트 */
  --bdr: rgba(255,255,255,0.06); /* 보더 — 거의 투명한 화이트 */
  --r: 20px; /* 기본 border-radius */
}

## 디자인 시스템 — Typography

폰트: 'Noto Sans KR', -apple-system, sans-serif (Pretendard도 유지하되 Noto Sans KR 우선)

Hero h1:
- clamp(34px, 5.5vw, 58px)
- weight 900
- letter-spacing -0.02em
- line-height 1.25

섹션 타이틀:
- clamp(26px, 4.2vw, 44px)
- weight 900
- line-height 1.35

본문:
- 15~18px
- weight 400
- color var(--t2)
- line-height 1.8

라벨:
- 12.5px
- weight 700
- color var(--lav)
- uppercase
- letter-spacing 0.1em

## 디자인 시스템 — 핵심 비주얼 요소

### 1. 라벤더 그라데이션 텍스트 (강조 키워드용)

.lav-text {
  background: linear-gradient(135deg, #7558CC, #9B7FE6, #D8CCF9, #BCA8F5, #9B7FE6);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

사용처: Hero “나만의 이야기”, 섹션 타이틀 강조어, Final CTA “나의 사주”

### 2. 글로우 배경 (Hero, Final CTA 뒤)

/* Hero 뒤 중앙 상단 글로우 */
.hero::before {
  content: '';
  position: absolute;
  top: -250px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(155,127,230,0.22) 0%, rgba(155,127,230,0.06) 40%, transparent 70%);
  pointer-events: none;
}

### 3. CTA 버튼 스타일

/* Primary CTA — 풀 그라데이션 필 */
.btn-primary {
  padding: 15px 34px;
  background: linear-gradient(135deg, #7558CC, #9B7FE6, #BCA8F5);
  color: #0A0810;
  font-weight: 700;
  font-size: 15px;
  border-radius: 99px; /* 완전 둥근 pill */
  box-shadow: 0 4px 28px rgba(155,127,230,0.35), 0 0 70px rgba(155,127,230,0.1);
  /* hover: 위로 살짝 + 그림자 강화 */
  /* 내부에 빛 스와이프 애니메이션 (::before pseudo) */
}

/* Secondary CTA — 아웃라인 */
.btn-outline {
  background: rgba(255,255,255,0.04);
  color: var(--t1);
  border: 1px solid var(--bdr);
  border-radius: 14px;
}

### 4. 카드 스타일

.card {
  background: #141220;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 36px;
  transition: all 0.3s;
}

.card:hover {
  background: #1A1730;
  border-color: rgba(155,127,230,0.16);
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(155,127,230,0.05);
}

### 5. 네비게이션

nav {
  position: fixed;
  height: 60px;
  background: rgba(10,8,16,0.8);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* 로고: 26px 라운드 아이콘 (라벤더 그라데이션 배경 + 한자 '命') + "운명사주" 텍스트 */
/* 우측: 가격 링크 + 로그인 링크 + "무료로 시작" pill CTA */

### 6. 반짝이는 파티클 (Hero, Final CTA 배경)

- 2~4.5px 크기 원형 파티클 20~25개
- 랜덤 위치, 라벤더 페일(#D8CCF9)
- box-shadow: 0 0 6px 1px #BCA8F5
- 떠오르며 fade in/out 애니메이션 (3~7초 주기, 랜덤 딜레이)

### 7. 구분선

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #BCA8F5, #D8CCF9, #BCA8F5, transparent);
  background-size: 200% 100%;
  animation: shimmer-line 3s ease-in-out infinite;
  opacity: 0.35;
}

### 8. 스크롤 Reveal 애니메이션

.reveal {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

IntersectionObserver threshold 0.12, rootMargin ‘0px 0px -30px 0px’.

-----

## 페이지 구조 (위에서 아래 순서)

### Section 1: Nav (fixed)

[命 아이콘] 운명사주 [가격] [로그인] [무료로 시작 →]

- “무료로 시작” → /input
- 모바일: 링크 숨기고 로고 + CTA만

### Section 2: Hero (min-height 100vh)

● Beta — 무료로 체험해 보세요
사주가 알려주는 ✨나만의 이야기✨
생년월일시를 입력하면 만세력 엔진이 정밀하게 계산하고,
AI가 따뜻한 언어로 당신의 운명을 풀어드려요.

[무료 사주 보기 →]
30초면 완료 · 회원가입 불필요

- 배경: 글로우 + 파티클
- h1 “나만의 이야기”만 lav-text
- CTA 아래 문구 var(--t3)

### Section 3: How it works (3단계)

HOW IT WORKS
3단계로 만나는 ✨나의 사주 리포트✨

- 3열(모바일 1열)
- 카드: bg-card + bdr + r
- 번호(01/02/03) 라벤더 10% 그라데이션 텍스트
- 아이콘: 44×44 라운드 박스, lav-dim

### Divider

### Section 4: Features (bg-s)

FEATURES
무료 분석만으로도 충분히 의미 있어요

- 첫 카드 span-2, 오행 바차트 + 카운트업
- 무료/프리미엄 태그 스타일

### Divider

### Section 5: Pricing

PRICING
부담 없이 시작하고, 마음에 들면 ✨더 깊이✨

- 2열(모바일 1열)
- 프리미엄 카드: 라벤더 dim 그라데이션 + animated border + BEST 뱃지

### Section 6: Beta Feedback

### Section 7: Final CTA

### Section 8: Footer

-----

## 반응형 브레이크포인트

- 768px 이하: nav links 숨김, 1열 그리드
- 480px 이하: h1 30px, section title 24px, card padding 축소

-----

## 구현 지시사항

1) src/app/globals.css: CSS 변수 전체를 :root에 추가(기존 교체)
2) tailwind.config.ts: extend.colors를 CSS 변수 참조로 매핑
3) src/app/layout.tsx: Noto Sans KR 폰트 로드
4) src/app/page.tsx: 전면 교체 (Framer Motion 또는 IO)
5) 링크: CTA → /input, 가격 → #pricing
6) 외부 이미지 없음 (CSS + 인라인 SVG)
7) Header/Footer 공통 컴포넌트 정리

-----

## 검증 체크리스트

- 배경색 #0A0810
- Hero 글로우
- lav-text shimmer
- 파티클
- 카드 호버
- 오행 바차트 애니메이션 + 퍼센트 카운트업
- premium card animated border
- reveal + divider shimmer
- CTA hover swipe
- 모바일 대응


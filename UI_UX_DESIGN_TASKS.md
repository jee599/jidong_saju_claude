# 운명사주 (FateSaju) UI/UX 디자인 개선 작업 지시서

> 기획팀 × 디자인팀 합동 리뷰 결과 (2026-02-24)
> Claude Code에 전달할 구체적 코드 수정 사항

---

## 작업 우선순위 요약

| Phase | 작업 수 | 예상 시간 | 목표 |
|-------|---------|----------|------|
| **Phase 1.1 (긴급)** | 5개 | ~5.5시간 | WCAG 접근성 + 성능 |
| **Phase 1.2 (높음)** | 5개 | ~7.5시간 | 컴포넌트 품질 + 전환율 |
| **Phase 2 (중기)** | 6개 | ~8시간 | 기능 확장 + 최적화 |

---

## Phase 1.1 — 긴급 개선 (이번 주)

### Task 1: Tertiary 텍스트 WCAG 접근성 수정

**파일:** `src/app/globals.css`

**변경 사항:**
- `--text-tertiary` 값을 `#6A6284` → `#8B84A8`로 변경
- 현재 배경(#0A0810) 대비 4.1:1 → 5.2:1로 개선 (WCAG AA 충족)

**추가:**
- `--color-warn` 값을 `#FBBF24` → `#F59E0B`로 변경 (포화도 높여 명확성 강화)
- `--color-metal` (금 오행): `#C0C0C0` → `#D4D4D4`로 변경 (다크 배경 대비 강화)

---

### Task 2: 기본 폰트 크기 15px → 16px

**파일:** `src/app/globals.css`

**변경 사항:**
- `--text-base-size: 15px` → `--text-base-size: 16px`
- `--leading-body: 1.7` → `--leading-body: 1.65` (약간 타이트하게)

**파일:** `tailwind.config.ts`

**추가:** fontSize 커스텀 정의가 있다면, base 크기를 16px로 맞추기

---

### Task 3: 최소 폰트 크기 보장 (text-[10px], text-[9px] 제거)

**대상 파일 및 변경:**

1. **`src/components/report/PillarCard.tsx`**
   - `text-[10px] sm:text-xs` → `text-xs sm:text-sm` (라벨들)
   - `text-[9px] sm:text-[10px]` → `text-[11px] sm:text-xs` (십성/12운성 배지)
   - `text-[10px]` (요소 배지) → `text-xs`

2. **`src/components/report/OhengChart.tsx`**
   - `text-[10px]` (퍼센트) → `text-xs`
   - `text-[9px]` (배지) → `text-[11px]`

3. **`src/components/report/DaeunTimeline.tsx`**
   - `text-[10px]` (나이) → `text-xs`
   - `text-[9px]` (십성) → `text-[11px]`
   - `text-[8px]` (현재 대운 표시) → `text-[11px]`

4. **랜딩 페이지 (`src/app/page.tsx`)**
   - `text-[12.5px]` → `text-xs` (13px 이하 커스텀 값들 표준화)

**원칙:** 프로젝트 전체에서 `text-[10px]`, `text-[9px]`, `text-[8px]` 사용을 모두 제거. 최소 `text-[11px]` 또는 `text-xs`(12px) 사용.

---

### Task 4: Sparkle 파티클 최적화

**파일:** `src/app/globals.css`

**변경:**
기존 `sparkle-float` 키프레임을 더 가벼운 `sparkle-fade`로 교체:

```css
@keyframes sparkle-fade {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.5; }
}
```

기존 sparkle-float 키프레임은 transform(translateY + scale)을 사용하는데, opacity만 사용하는 sparkle-fade로 교체하여 GPU 부하 감소.

**파일:** `src/app/page.tsx` (또는 SparkleField 컴포넌트가 있는 곳)

**변경:**
- Hero 섹션 Sparkle count: 현재 22개 → **15개**로 줄이기
- CTA 섹션 Sparkle count: 현재 14개 → **8개**로 줄이기
- 각 sparkle의 animation을 `sparkle-float` → `sparkle-fade`로 변경
- `transform` 속성 제거하고 `opacity`만 사용

**추가:**
```css
@media (prefers-reduced-motion: reduce) {
  [class*="sparkle"] { display: none !important; }
}
```

---

### Task 5: Shimmer 텍스트 hover-only 전환

**파일:** `src/app/globals.css`

**변경:**
현재 `.lav-text`에 항상 적용되는 shimmer 애니메이션을:

```css
/* Before */
.lav-text {
  /* ... gradient 설정 ... */
  animation: shimmer 5s ease-in-out infinite;
}

/* After */
.lav-text {
  /* ... gradient 설정은 유지 ... */
  /* animation 제거 - 정적 그래디언트만 표시 */
}

.lav-text:hover,
.lav-text-animate {
  animation: shimmer 3s ease-in-out infinite;
}
```

이렇게 하면 평소에는 정적 그래디언트 텍스트로 보이고, 호버 시에만 반짝임.
단, Hero 섹션의 메인 타이틀에는 `lav-text-animate` 클래스를 추가로 붙여서 항상 반짝이게 유지.

---

## Phase 1.2 — 높은 우선순위 (2주 이내)

### Task 6: PillarCard 크기 확대

**파일:** `src/components/report/PillarCard.tsx`

**변경:**

| 속성 | Before | After |
|------|--------|-------|
| 카드 패딩 | `p-3 sm:p-4` | `p-4 sm:p-6` |
| 한자 크기 | `text-2xl sm:text-3xl` | `text-3xl sm:text-5xl` |
| 한글 발음 | `text-[10px] sm:text-xs` | `text-xs sm:text-sm` |
| 요소 배지 | `w-6 h-6` | `w-8 h-8 sm:w-10 sm:h-10` |
| 배지 위치 | `-top-2 -right-2` | `-top-3 -right-3` |
| 배지 텍스트 | `text-[10px]` | `text-xs sm:text-sm` |

**추가:**
- 한자에 `style={{ letterSpacing: '0.05em' }}` 추가 (한자 간 간격)
- 천간/지지 사이에 구분선 추가: `<div className="w-8 h-px bg-white/10 my-1.5" />`

---

### Task 7: OhengChart 개선

**파일:** `src/components/report/OhengChart.tsx`

**변경:**

| 속성 | Before | After |
|------|--------|-------|
| 바 높이 | `h-6` | `h-8 sm:h-10` |
| 행 간격 | `space-y-3` 또는 `gap-3` | `space-y-4 sm:space-y-5` |
| 라벨 폭 | `w-12` | `w-16` |
| 라벨 크기 | `text-xs font-bold` | `text-sm sm:text-base font-bold` |
| 퍼센트 크기 | `text-[10px]` | `text-xs sm:text-sm` |
| 배지 크기 | `text-[9px] px-1.5 py-0.5` | `text-xs px-2 py-1` |

---

### Task 8: DateInput 연도 선택 UX 개선

**파일:** `src/components/input/DateInput.tsx`

**현재 문제:** 연도 선택 시 12개씩 페이지네이션 → 1987년 선택하려면 3페이지 이동 필요

**추가 기능: 연대별 Quick Jump**

연도 그리드 상단에 연대 버튼 추가:
```tsx
<div className="flex gap-1.5 px-3 pt-3 pb-1 overflow-x-auto">
  {['60', '70', '80', '90', '00', '10', '20'].map(decade => (
    <button
      key={decade}
      onClick={() => jumpToDecade(parseInt(decade))}
      className="px-2.5 py-1 text-xs rounded-lg bg-bg-sunken text-text-secondary hover:bg-brand-muted hover:text-brand-light transition-colors whitespace-nowrap"
    >
      {parseInt(decade) < 30 ? `20${decade}` : `19${decade}`}
    </button>
  ))}
</div>
```

`jumpToDecade` 함수: 해당 연대의 첫 해가 포함된 페이지로 이동하도록 `yearPage` state 변경.

---

### Task 9: PaywallCTA 블러 + 전환 강화

**파일:** `src/components/report/PaywallCTA.tsx`

**변경:**

| 속성 | Before | After |
|------|--------|-------|
| 아이콘 | `w-14 h-14` | `w-20 h-20 sm:w-24 sm:h-24` |
| 제목 크기 | `text-lg font-bold` | `text-xl sm:text-2xl font-bold` |
| 버튼 텍스트 | "풀 리포트 구매하기" | "지금 구매하기" |
| 패딩 | `p-6 sm:p-8` | `p-8 sm:p-10` |
| 기능 리스트 텍스트 | 현재 크기 | `text-sm` 보장 |

**추가:**
- 가격 영역을 별도 블록으로 분리:
```tsx
<div className="bg-bg-sunken/50 rounded-xl p-4 text-center mb-6 border border-white/5">
  <p className="text-text-secondary text-xs mb-1">한 번의 결제로 영구 이용</p>
  <span className="text-4xl font-bold text-accent">5,900</span>
  <span className="text-lg text-text-secondary ml-1">원</span>
</div>
```

**파일:** `src/components/report/SectionCard.tsx`

**변경:**
- Locked 상태의 `max-h-24` → `max-h-36 sm:max-h-40` (더 많은 미리보기 노출)
- 블러 그래디언트: `from-transparent to-bg-elevated` → `from-transparent via-bg-elevated/30 to-bg-elevated` (더 부드럽게)

---

### Task 10: Hero 섹션 강화

**파일:** `src/app/page.tsx`

**변경:**
1. Hero CTA 버튼 크기 확대:
   - 현재 `py-3 px-7 text-[15px]` → `py-4 px-8 text-base sm:text-lg`
   - 모바일에서도 44px+ 터치 타겟 보장

2. Hero 서브텍스트 개선:
   - 현재: "AI가 명리학으로 풀어내는 당신의 운명"
   - 변경: 슬로건 아래에 1줄 설명 추가
   ```
   "생년월일시만 입력하면 만세력 엔진이 계산하고, Claude AI가 전문가처럼 해석합니다."
   ```

3. 스크롤 인디케이터 텍스트 추가:
   - 현재: 화살표만
   - 추가: `"스크롤해서 더 보기"` 라벨 (text-xs, text-text-tertiary)

---

## Phase 2 — 중기 개선 (1개월)

### Task 11: DaeunTimeline 확대

**파일:** `src/components/report/DaeunTimeline.tsx`

**변경:**

| 속성 | Before | After |
|------|--------|-------|
| 카드 폭 | `w-20 sm:w-24` | `w-28 sm:w-32` |
| 패딩 | `p-3` | `p-4 sm:p-5` |
| 한자 크기 | `text-lg sm:text-xl` | `text-2xl sm:text-3xl` |
| 나이 텍스트 | `text-[10px]` | `text-xs sm:text-sm` |
| 십성 텍스트 | `text-[9px]` | `text-xs` |
| 카드 간격 | `gap-3` | `gap-4` |

**추가:**
- 현재 대운 카드에 "현재" 배지 추가:
```tsx
{entry.isCurrentDaeun && (
  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold mt-1.5">
    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
    현재
  </span>
)}
```

---

### Task 12: 모바일 PillarCard 2×2 그리드

**파일:** `src/app/report/[id]/page.tsx` (또는 PillarCard를 감싸는 부모)

**변경:**
사주 4기둥 그리드를:
```tsx
{/* Before: 항상 4열 */}
<div className="grid grid-cols-4 gap-2 sm:gap-3">

{/* After: 모바일 2열, 데스크톱 4열 */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
```

이렇게 하면 모바일에서 2×2로 표시되어 카드가 더 크게 보임.

---

### Task 13: 로딩 화면 섹션별 진행 표시

**파일:** `src/components/loading/LoadingScreen.tsx` (또는 `src/app/report/new/page.tsx`)

**현재:** 단순 progress 값만 표시
**목표:** 섹션별 완료 상태 시각적 표시

**추가할 UI:**
로딩 Phase 2 (AI 분석 중)에서:
```tsx
<div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
  {SECTIONS.map((section, i) => (
    <div key={section} className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all ${
      completedSections.includes(section)
        ? 'text-success bg-success/10'
        : currentSection === section
        ? 'text-accent bg-accent/10 animate-pulse'
        : 'text-text-tertiary'
    }`}>
      <span>{completedSections.includes(section) ? '✓' : currentSection === section ? '⏳' : '○'}</span>
      <span>{SECTION_NAMES[section]}</span>
    </div>
  ))}
</div>
```

이를 위해 API 응답에서 `sectionsCompleted` 배열을 받아 상태를 업데이트해야 함.
SSE(Server-Sent Events)로 전환하는 것이 이상적이나, 단기적으로는 `onSectionComplete` 콜백을 통해 구현 가능.

---

### Task 14: SectionCard 제목 크기 + 키워드 배지 개선

**파일:** `src/components/report/SectionCard.tsx`

**변경:**

| 속성 | Before | After |
|------|--------|-------|
| 제목 | `text-base sm:text-lg` | `text-lg sm:text-xl` |
| 제목 마진 | `mb-3` | `mb-4` |
| 키워드 배지 | `text-[10px] px-2 py-0.5` | `text-xs px-2.5 py-1` |
| 배지 간격 | `gap-1.5` | `gap-2` |
| 본문 크기 | `text-sm` | `text-sm sm:text-base` |

---

### Task 15: 모션 타이밍 표준화

**파일:** `src/app/globals.css`

**추가:** CSS 커스텀 프로퍼티로 모션 토큰 정의:

```css
:root {
  --transition-fast: 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  --transition-normal: 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  --transition-slow: 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  --motion-enter-distance: 16px;
}
```

**파일:** 각 컴포넌트에서 Framer Motion transition을 표준화:

| 용도 | 현재 | 표준 |
|------|------|------|
| 카드 등장 | duration: 0.4~0.6, ease: various | duration: 0.4, ease: [0.22, 1, 0.36, 1] |
| hover/toggle | 각양각색 | duration: 0.2, ease: [0.22, 1, 0.36, 1] |
| 팔자 플립 | duration: 0.6 | duration: 0.5 (유지 가능) |
| 바 확장 | duration: 0.8 | duration: 0.6 (약간 단축) |

---

### Task 16: TermPopover 명리 용어 팝오버 구현

**새 파일:** `src/components/report/TermPopover.tsx`

**설명:** 리포트 텍스트 내 명리학 용어(십성, 12운성, 오행 등)에 호버/탭 시 해설 팝오버 표시

**구현:**
```tsx
interface TermPopoverProps {
  term: string;       // "편관"
  hanja?: string;     // "偏官"
  description: string; // "외부에서 오는 도전과 압박의 에너지"
  children: React.ReactNode;
}

export function TermPopover({ term, hanja, description, children }: TermPopoverProps) {
  // Radix Popover 또는 자체 구현
  // 트리거: 밑줄 처리된 텍스트
  // 팝오버: 용어 + 한자 + 쉬운 설명
  // 모바일: 탭, 데스크톱: 호버
}
```

**용어 데이터:**
```typescript
// src/lib/saju/terms.ts
export const SAJU_TERMS: Record<string, { hanja: string; description: string }> = {
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
  "장생": { hanja: "長生", description: "에너지가 태어나는 단계. 새로운 시작" },
  "목욕": { hanja: "沐浴", description: "성장하며 불안정한 단계. 변화와 도전" },
  "관대": { hanja: "冠帶", description: "성인이 되는 단계. 자신감과 독립" },
  "건록": { hanja: "建祿", description: "사회적으로 자리잡는 단계. 안정과 실력" },
  "제왕": { hanja: "帝旺", description: "에너지가 최고조인 단계. 권위와 성취" },
  "쇠": { hanja: "衰", description: "에너지가 줄어드는 단계. 성숙과 절제" },
  // ... 나머지 12운성, 신살 등
};
```

**적용:** 리포트 텍스트 렌더링 시 SAJU_TERMS의 키와 매칭되는 단어를 자동으로 TermPopover로 래핑.

---

## 전체 파일 수정 목록

| 파일 | Task |
|------|------|
| `src/app/globals.css` | 1, 2, 4, 5, 15 |
| `src/components/report/PillarCard.tsx` | 3, 6 |
| `src/components/report/OhengChart.tsx` | 3, 7 |
| `src/components/report/DaeunTimeline.tsx` | 3, 11 |
| `src/components/report/SectionCard.tsx` | 3, 9, 14 |
| `src/components/report/PaywallCTA.tsx` | 9 |
| `src/components/input/DateInput.tsx` | 8 |
| `src/components/loading/LoadingScreen.tsx` | 13 |
| `src/app/page.tsx` | 3, 4, 5, 10 |
| `src/app/report/[id]/page.tsx` | 12 |
| `src/app/report/new/page.tsx` | 13 |
| `src/components/report/TermPopover.tsx` | 16 (신규) |
| `src/lib/saju/terms.ts` | 16 (신규) |
| `tailwind.config.ts` | 2 |

---

## 작업 시 주의사항

1. **한 Task씩 순서대로** 진행. 각 Task 완료 후 `npm run build` 확인.
2. **모바일 먼저** 확인. 주요 타겟은 375px 너비 (iPhone SE/mini).
3. **기존 Framer Motion 애니메이션** 깨지지 않도록 주의.
4. **오행 색상**은 절대 변경하지 말 것 (Wood/Fire/Earth/Water 유지, Metal만 밝게).
5. **폰트 로딩 순서** 변경 금지 (Noto Sans KR → Pretendard fallback 유지).
6. **다크 모드 전용** — 라이트 모드 고려 불필요 (Phase 1은 다크만).

# Landing redesign additions (to merge into TASK-LANDING-REDESIGN.md)

Source: user message 2026-02-24

---

## 추가 1: Stats Strip (Hero 바로 아래)
삽입 위치: Hero 섹션 하단, “How it works” 섹션 시작 전

518,400+ / 139개 / <1초

스펙:
- 전체 max-width: 680px, 중앙 정렬
- 3열 균등 분할, 세로 구분선(1px, var(–bdr))
- 숫자: clamp(32px, 4vw, 44px), weight 900, 라벤더 그라데이션 텍스트
- 라벨: 13px, var(–t2), weight 500
- IntersectionObserver 진입 시 카운트업:
  - 518,400 → duration 2s, easeOutExpo
  - 139 → duration 1.5s
  - <1 → 카운트업 없이 fade-in
- 천 단위 콤마: “518,400+”
- 모바일: 3열 유지 (숫자 크기만 축소)
- 배경: 없음 (Hero와 자연스럽게 연결)

카운트업 구현 참고 코드 포함.

---

## 추가 2: Precision Comparison (Features 섹션 내)
삽입 위치: Features 섹션, 기존 카드들 위에 첫 번째 요소로 “당신을 설명하는 다른 방법들”과 사주 대비.

KR/EN 레이아웃 및 공통 스펙, i18n dictionary 키 추가 포함.

전략 A(캐시 우선) 언급과는 별도(디자인 섹션).

---

## 추가 4: Rotating Words (Hero h1 단어 회전)
삽입 위치: Hero 섹션 h1 내부

KR words: ["성격","직업","연애","올해 운세","타이밍"]
EN words (Phase 2): ["personality","career","love life","timing","year ahead"]

스펙/구현 참고 및 레이아웃 시프트 방지(min-width 측정) 포함.

---

## 추가 5: Marquee (천간지지 흘러가는 띠)
삽입 위치: 옵션 A(Stats Strip 아래) 또는 옵션 B(기존 구분선 대체)

한자 흘러가는 배경 텍스처, opacity 0.08 핵심.

prefers-reduced-motion 대응 필요.

---

## 추가 3: Engine Trust Bar (How it works 하단)
삽입 위치: “How it works” 3단계 카드 아래, 구분선 위

✓ 만세력 정밀 계산 ✓ 절기 경계 보정 ✓ 139개 검증 벡터 ✓ 초자시 처리

텍스트-only, wrap 허용.

---

## 전체 페이지 흐름 (최종)
Nav → Hero(h1 rotating) → Stats Strip → Marquee → How it works + Trust Bar → Features(Precision Comparison first) → Pricing → Beta Feedback → Final CTA → Footer

주의: 과하지 않게 유지 원칙 포함.

---

(원문 전체는 채팅 메시지 참고; 이 파일은 작업용 요약/체크리스트)

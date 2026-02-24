# FateSaju (운명사주) — Project Status & Architecture

> **Last updated:** 2026-02-24
> **Version:** 0.2.0
> **Phase:** MVP Phase 1 (Korean-only)
> **Preview:** <https://fatesaju-ercr9ofa1-jidongs45-3347s-projects.vercel.app>

---

## 1. Implemented Features

### Core Manseryeok Engine (`688b2d1`)
| Feature | Description |
|---------|-------------|
| Four Pillars (사주팔자) | Year/Month/Day/Hour pillars via `lunar-javascript` + custom logic |
| Jeolgi boundary | Solar-term-based month pillar; handles dates before/after 입춘 etc. |
| Sipseong (십성) | Day-stem vs all other stems (비견/겁재/식신/상관/편재/정재/편관/정관/편인/정인) |
| 12 Unseong (12운성) | Day-stem x branch lookup: 장생→양 cycle |
| Oheng (오행) | Wood/Fire/Earth/Metal/Water distribution across all stems + jijanggan |
| Interactions (합충형파해) | 육합, 삼합, 방합, 충, 형, 파, 해 (地支) + 천간합/충 |
| Sinsal (신살) | 천을귀인, 문창귀인, 도화살, 역마살, 화개살, 양인살, 홍염살, 겁살, 망신살 |
| Daeun (대운) | 10-year major fortune periods; gender + year-stem yin/yang → forward/reverse |
| Seun (세운) | 2026 annual fortune interaction with natal chart |
| Geokguk (격국) | 정관/편관/정인/편인/식신/상관/정재/편재/건록/양인격 determination |
| Yongsin (용신) | 억부 > 조후 > 통관 priority; rationale + method string |
| Day-master strength | Score based on 월지득령, 일지근기, overall support count |
| Jijanggan (지장간) | Hidden heavenly stems within each earthly branch |

### Free / Premium Tiers (`251eb04`)
| Tier | Sections | LLM max_tokens | Price |
|------|----------|----------------|-------|
| Free | personality, career, love, present (4) | 800 | 0 |
| Premium Full | All 10 sections | 2,000 | 5,900 KRW |
| Compatibility | 2-person comparison | 2,000 | 7,900 KRW |
| Yearly Fortune | Monthly breakdown for 2026 | 2,000 | 4,900 KRW |
| All-in-one | Full + Compatibility + Yearly | 2,000 | 14,900 KRW |

### Frontend
- **Landing page** with Hero, How-it-Works, Features, Pricing, FAQ
- **Step-by-step input form** — date picker, time picker with Korean branch labels (`7c65f50`), calendar type, gender, optional name
- **i18n** — Korean dictionary (`484f065`); English structure prepared
- **Report viewer** — PillarCard, OhengChart (Recharts radar), DaeunTimeline, SectionCard, TermPopover, PaywallCTA, ShareCard
- **Loading screen** — pillar flip animation, progressive section reveal, mini tips
- **Compatibility & Yearly** — dedicated input & result pages
- **Auth** — Supabase magic-link login, profile management
- **Responsive** — mobile-first dark theme, Framer Motion animations

### Payment
- Toss Payments integration (create order → redirect → confirm)
- DB persistence of payment records
- Tier upgrade on confirmation

### Testing (139+ golden vectors)
- Vitest unit tests across engine, LLM, payment, components, API, i18n

---

## 2. Folder Structure

```
fatesaju/
├── docs/
│   ├── db.sql                          # Supabase schema + RLS
│   └── STATUS.md                       # ← this file
│
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout (Pretendard, Noto Serif KR)
│   │   ├── globals.css
│   │   ├── input/page.tsx              # Birth-info form
│   │   ├── report/[id]/page.tsx        # Report viewer (free + premium)
│   │   ├── compatibility/
│   │   │   ├── page.tsx                # Compatibility input
│   │   │   └── result/page.tsx         # Compatibility result
│   │   ├── yearly/
│   │   │   ├── page.tsx                # Yearly fortune input
│   │   │   └── result/page.tsx         # Yearly fortune result
│   │   ├── pricing/page.tsx            # Pricing page
│   │   ├── auth/
│   │   │   ├── login/page.tsx          # Login (magic link)
│   │   │   └── callback/route.ts       # Auth callback
│   │   └── api/
│   │       ├── saju/calculate/route.ts # POST — manseryeok calculation
│   │       ├── saju/report/route.ts    # POST — LLM report generation
│   │       ├── compatibility/route.ts  # POST — 2-person compatibility
│   │       ├── yearly/route.ts         # POST — annual fortune
│   │       ├── payment/create/route.ts # POST — Toss payment intent
│   │       ├── payment/confirm/route.ts# GET  — Toss confirm + tier upgrade
│   │       └── payment/webhook/route.ts# POST — Toss webhook (stub)
│   │
│   ├── lib/
│   │   ├── saju/                       # Manseryeok engine
│   │   │   ├── engine.ts               # Main orchestrator
│   │   │   ├── types.ts                # SajuResult, ReportResult, etc.
│   │   │   ├── constants.ts            # 천간/지지 data, 조견표
│   │   │   ├── calendar.ts             # lunar-javascript wrapper
│   │   │   ├── sipseong.ts             # Ten stems logic
│   │   │   ├── unseong.ts              # 12 fortunes lookup
│   │   │   ├── oheng.ts                # Five elements distribution
│   │   │   ├── yongsin.ts              # Yongsin/gisin/heesin
│   │   │   ├── daeun.ts                # Major fortune calculation
│   │   │   ├── geokguk.ts              # Zodiac structure
│   │   │   ├── interactions.ts         # Hap/chung/hyeong/pa/hae
│   │   │   ├── sinsal.ts              # Special stars
│   │   │   └── timeBranch.ts           # Hour pillar logic
│   │   │
│   │   ├── llm/
│   │   │   ├── client.ts              # Claude API client (fetch-based)
│   │   │   ├── parallel.ts            # Parallel generation + usage tracking
│   │   │   ├── prompts.ts             # System prompt + per-section prompts
│   │   │   └── cache.ts               # Vercel KV / DB caching
│   │   │
│   │   ├── payment/toss.ts            # Toss Payments wrapper + PRICING map
│   │   ├── db/supabase.ts             # Supabase clients (browser + admin)
│   │   ├── db/queries.ts              # DB access layer
│   │   ├── auth/helpers.ts            # Auth utilities
│   │   ├── i18n/context.tsx           # React locale context
│   │   ├── i18n/dictionary.ts         # Korean translations
│   │   └── utils/
│   │       ├── hash.ts                # SHA-256 saju hash + order ID generator
│   │       └── format.ts              # Formatting helpers
│   │
│   ├── components/
│   │   ├── report/                    # PillarCard, OhengChart, DaeunTimeline,
│   │   │                              # SectionCard, TermPopover, PaywallCTA, ShareCard
│   │   ├── loading/LoadingScreen.tsx   # Pillar-flip + progressive loading
│   │   ├── input/DateInput.tsx         # Date & time picker
│   │   ├── common/Header.tsx, Footer.tsx
│   │   └── ui/Button.tsx
│   │
│   ├── hooks/
│   │   ├── useSajuCalculation.ts
│   │   ├── useReportGeneration.ts
│   │   └── usePayment.ts
│   │
│   └── styles/theme.ts               # Color palette, oheng colors
│
├── tests/
│   ├── saju/engine-golden.test.ts     # 139+ golden vectors
│   ├── saju/engine.test.ts
│   ├── saju/sipseong.test.ts
│   ├── saju/timeBranch.test.ts
│   ├── llm/parallel.test.ts
│   ├── llm/cache.test.ts
│   ├── payment/toss.test.ts
│   ├── utils/hash.test.ts
│   ├── utils/format.test.ts
│   ├── components/DateInput.test.ts
│   ├── api/calculate.test.ts
│   └── i18n/dictionary.test.ts
│
├── package.json                       # v0.2.0, Next.js 16, React 19
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── .env.example
└── CLAUDE.md                          # Full project specification
```

---

## 3. API Routes

### `POST /api/saju/calculate`

Calculate four pillars from birth info (no LLM).

**Request:**
```json
{
  "name": "홍길동",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "gender": "male",
  "calendarType": "solar",
  "isLeapMonth": false
}
```

**Response (200):**
```json
{
  "sajuResult": {
    "input": { ... },
    "pillars": {
      "year":  { "gan": "庚", "ji": "午", ... },
      "month": { "gan": "辛", "ji": "巳", ... },
      "day":   { "gan": "甲", "ji": "辰", ... },
      "hour":  { "gan": "辛", "ji": "未", ... }
    },
    "dayMaster": { "gan": "甲", "element": "木", "yinYang": "양", ... },
    "sipseong": { "distribution": { ... }, "dominant": "편관", "missing": [] },
    "unseong": { ... },
    "oheng": { "distribution": { "木": { "count": 2, "percentage": 25 }, ... } },
    "yongsin": { "yongsin": "水", "gisin": "火", ... },
    "interactions": { "haps": [...], "chungs": [...] },
    "sinsals": [{ "name": "천을귀인", "location": "시지", ... }],
    "daeun": [{ "startAge": 4, "ganji": "壬午", ... }],
    "seun": { "year": 2026, "ganJi": "丙午", ... },
    "geokguk": { "name": "편관격", ... }
  },
  "sajuHash": "a1b2c3..."
}
```

---

### `POST /api/saju/report`

Generate LLM-interpreted report from birth info.

**Request:**
```json
{
  "input": {
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "gender": "male",
    "calendarType": "solar"
  },
  "tier": "free"
}
```

**Response (200):**
```json
{
  "reportId": "uuid-or-null",
  "sajuResult": { ... },
  "sajuHash": "...",
  "freeSummary": {
    "personalitySummary": "갑목(甲木) 일간으로...",
    "yearKeyword": "도약의 해"
  },
  "report": {
    "sections": {
      "personality": { "title": "성격과 기질", "text": "...", "keywords": [...], "highlights": [...] },
      "career": { ... }
    },
    "generatedAt": "2026-02-24T10:00:00Z",
    "model": "claude-sonnet-4-5-20250514",
    "tier": "free",
    "usage": {
      "totalInputTokens": 12500,
      "totalOutputTokens": 3200,
      "estimatedCostUsd": 0.0855
    }
  },
  "tier": "free"
}
```

---

### `POST /api/compatibility`

Two-person saju compatibility analysis.

**Request:**
```json
{
  "personA": { "birthDate": "1990-05-15", "birthTime": "14:30", "gender": "male", "calendarType": "solar" },
  "personB": { "birthDate": "1992-08-20", "birthTime": "09:00", "gender": "female", "calendarType": "solar" }
}
```

**Response (200):**
```json
{
  "sajuA": { ... },
  "sajuB": { ... },
  "basicAnalysis": {
    "score": 78,
    "dayMasterRelation": "상생",
    "dayJiRelation": "육합",
    "complementary": true,
    "summaryA": "...",
    "summaryB": "..."
  },
  "llmAnalysis": {
    "title": "두 분의 궁합",
    "score": 82,
    "summary": "...",
    "strengths": ["..."],
    "cautions": ["..."],
    "text": "...",
    "keywords": ["..."]
  }
}
```

---

### `POST /api/yearly`

Annual fortune analysis.

**Request:**
```json
{
  "input": { "birthDate": "1990-05-15", "birthTime": "14:30", "gender": "male", "calendarType": "solar" },
  "year": 2026
}
```

**Response (200):**
```json
{
  "sajuResult": { ... },
  "year": 2026,
  "basicYearly": {
    "year": 2026,
    "seunGanji": "丙午",
    "seunElement": "火",
    "seunSipseong": "편인",
    "keywords": ["변화", "성장"],
    "summary": "...",
    "yongsinAdvice": "..."
  },
  "yearlyAnalysis": {
    "title": "2026년 운세",
    "yearKeywords": [...],
    "summary": "...",
    "months": [{ "month": 1, "text": "...", "energy": 4 }, ...],
    "turningPoints": ["..."],
    "bestMonths": [3, 7],
    "cautionMonths": [6, 11]
  }
}
```

---

### `POST /api/payment/create`

Create a Toss payment intent.

**Request:**
```json
{
  "reportId": "uuid",
  "productType": "full"
}
```

**Response (200):**
```json
{
  "orderId": "SAJU-1708...",
  "amount": 5900,
  "orderName": "운명사주 풀 리포트",
  "clientKey": "test_ck_...",
  "successUrl": "https://fatesaju.com/api/payment/confirm?reportId=...",
  "failUrl": "https://fatesaju.com/pricing?status=fail"
}
```

---

### `GET /api/payment/confirm`

Toss redirect after payment. Confirms with Toss API, updates report tier.

### `POST /api/payment/webhook`

Toss webhook endpoint (stub — cancellation handling TODO).

---

## 4. Data Model & Supabase Tables

Full schema is at [`docs/db.sql`](./db.sql).

### Tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `profiles` | Extends `auth.users` | `id` (FK), `email`, `display_name` |
| `reports` | Persists saju + LLM results | `saju_hash`, `input_json`, `saju_result`, `report_json`, `report_type`, `tier` |
| `payments` | Payment records | `order_id`, `payment_key`, `amount`, `status`, `report_id` |
| `report_cache` | LLM response cache | `saju_hash` + `section_key` (composite PK), `content` |

### Row-Level Security (RLS)

- **profiles**: Select/update own profile only
- **reports**: Select own + anonymous (null `user_id`); insert open; service-role update
- **payments**: Select own; service-role insert/update
- **report_cache**: Public read; service-role write

### Triggers

- `on_auth_user_created` — auto-inserts a `profiles` row on signup

### Indexes

- `idx_reports_user_id`, `idx_reports_saju_hash`
- `idx_payments_order_id`, `idx_payments_payment_key`, `idx_payments_report_id`

---

## 5. LLM / Report Generation Pipeline

### Architecture

```
Input form → POST /api/saju/report
  │
  ├─ [1] Manseryeok engine: SajuInput → SajuResult (code, instant)
  │
  ├─ [2] Cache check: SHA-256(birthDate+birthTime+gender+calendarType+section)
  │      Hit  → return cached section
  │      Miss → continue to LLM
  │
  ├─ [3] Parallel LLM calls (Promise.all)
  │      ├─ Free:    4 sections × 800 max_tokens
  │      └─ Premium: 10 sections × 2,000 max_tokens
  │
  │      Model: claude-sonnet-4-5-20250514
  │      System prompt: Korean fortune-telling expert (10 rules, 16 banned phrases)
  │      Per-section prompt: Saju JSON + section-specific requirements
  │
  ├─ [4] JSON parse (handles ```json blocks); fallback to raw text
  │
  ├─ [5] Retry on failure: exponential backoff (1s, 2s), max 2 retries
  │
  └─ [6] Aggregate: sections + usage stats → ReportResult
```

### Usage Tracking & Cost Accounting

Every report generation logs to stdout:

```
[LLM Usage] tier=free sections=4 input=12500 output=3200 cost=$0.0855
```

The `UsageStats` object is included in the API response:

```typescript
{
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostUsd: number;  // (input/1M)*INPUT_PRICE + (output/1M)*OUTPUT_PRICE
}
```

Default pricing (configurable via env):
- Input: $3/M tokens (`LLM_INPUT_PRICE_PER_M`)
- Output: $15/M tokens (`LLM_OUTPUT_PRICE_PER_M`)

### Caching

- **Key:** `SHA-256(birthDate + birthTime + gender + calendarType + sectionKey)`
- **Stores:** Vercel KV (Redis) primary, Supabase `report_cache` table fallback
- **Effect:** Same birth info = same saju = reusable LLM output (cost $0)

### Placeholder Mode

When `ANTHROPIC_API_KEY` is not set, the system returns stub sections with a message prompting configuration. No API calls are made.

---

## 6. Environment Variables

| Variable | Required | Where to set | Description |
|----------|----------|-------------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for LLM) | Vercel + `.env.local` | Claude API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for DB) | Vercel + `.env.local` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for DB) | Vercel + `.env.local` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for DB) | Vercel + `.env.local` | Supabase service role key (server-only) |
| `TOSS_CLIENT_KEY` | Yes (for payment) | Vercel + `.env.local` | Toss Payments client key |
| `TOSS_SECRET_KEY` | Yes (for payment) | Vercel + `.env.local` | Toss Payments secret key (server-only) |
| `KV_REST_API_URL` | Optional | Vercel | Vercel KV Redis URL |
| `KV_REST_API_TOKEN` | Optional | Vercel | Vercel KV Redis token |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | Optional | Vercel + `.env.local` | KakaoTalk share button |
| `LLM_INPUT_PRICE_PER_M` | Optional | Vercel + `.env.local` | USD per 1M input tokens (default: 3) |
| `LLM_OUTPUT_PRICE_PER_M` | Optional | Vercel + `.env.local` | USD per 1M output tokens (default: 15) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Vercel + `.env.local` | Base URL for callbacks (default: fatesaju.com) |

**Template:** see `.env.example` in project root.

**Vercel setup:** Settings → Environment Variables. Use separate values for Preview/Production.

---

## 7. QA / Testing Strategy

### Framework

- **Vitest** (v4) with `globals: true`
- Path alias: `@` → `./src`
- Config: `vitest.config.ts`

### Running Tests

```bash
npm test              # Run all tests once (CI)
npm run test:watch    # Watch mode (development)
```

### Test Files

| File | Coverage |
|------|----------|
| `tests/saju/engine-golden.test.ts` | **139+ golden vectors** — verified four-pillar outputs for known dates, jeolgi boundaries, midnight edge cases, leap months, famous figures |
| `tests/saju/engine.test.ts` | Engine integration tests |
| `tests/saju/sipseong.test.ts` | Ten stems calculation |
| `tests/saju/timeBranch.test.ts` | Hour pillar (시주) edge cases |
| `tests/llm/parallel.test.ts` | Parallel generation, fallback, usage aggregation |
| `tests/llm/cache.test.ts` | Cache hit/miss, key generation |
| `tests/payment/toss.test.ts` | Toss API wrapper, pricing map |
| `tests/utils/hash.test.ts` | SHA-256 hash, order ID generation |
| `tests/utils/format.test.ts` | Formatting utilities |
| `tests/components/DateInput.test.ts` | Date input component |
| `tests/api/calculate.test.ts` | Calculate API endpoint |
| `tests/i18n/dictionary.test.ts` | Korean dictionary completeness |

### Golden Test Edge Cases

- Jeolgi boundaries (입춘 2/4, 대서, 입추, etc.)
- 초자시 (23:00-01:00 midnight crossing)
- Leap month (윤달) handling
- Noon (午時) edge
- Historical figures validation

---

## 8. Known TODOs, Risks & Next Steps

### TODOs

| Area | Description | Priority |
|------|-------------|----------|
| Payment webhook | `POST /api/payment/webhook` — cancellation handling not implemented | Medium |
| DB fallback | `report/[id]/page.tsx` uses `sessionStorage` when Supabase is not configured | Low |
| Toss SDK widget | Payment uses redirect flow, not embedded modal widget | Low |
| Analytics | PostHog/Mixpanel not integrated | Medium |
| Email validation | Auth flow does not validate email format client-side | Low |

### Risks

| Risk | Mitigation |
|------|-----------|
| LLM cost spike | Free tier capped at 4 sections / 800 tokens; usage logged; cache reduces repeat calls |
| Saju accuracy | 139+ golden vectors; lunar-javascript for calendar; jeolgi boundary tests |
| Payment security | Toss handles PCI; server-side confirmation with secret key; RLS on DB |
| SEO competition | Target "무료 사주" (110K monthly searches); strong meta tags in place |

### Next Steps (Phase 2)

- English market launch on k-fate.com
- KakaoTalk / social share card generation
- PostHog analytics integration
- Toss embedded payment widget (in-page modal)
- User dashboard (past reports, payment history)
- SEO blog content for organic traffic

---

## Milestone Commits

| Hash | Description |
|------|-------------|
| `0c18361` | Initial Next.js scaffold |
| `2893c36` | Project init — branding, deps, folder structure |
| `1a8d7ba` | Manseryeok engine — core saju calculation, 79 tests |
| `6c01367` | LLM integration — Claude client, prompts, parallel calls, caching |
| `1d57c6d` | Frontend components + hooks |
| `673724b` | Supabase DB schema SQL |
| `0d16eb9` | Compatibility + Yearly fortune (Step 8) |
| `8a13bef` | E2E product integration — auth, payment, report delivery |
| `d2566d9` | Calendar date picker |
| `484f065` | Step-by-step date picker, i18n, modern design |
| `7c65f50` | Korean time branch labels (시) |
| `251eb04` | Free/premium tier logic, LLM usage tracking, prompt quality |
| `688b2d1` | Engine 고도화 — 격국, 천간합충, 파해, 용신 rationale, 신강점수, 139 golden tests |

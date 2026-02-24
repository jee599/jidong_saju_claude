# 운명사주 (FateSaju)

AI가 명리학으로 풀어내는 당신의 운명 — AI 사주 리포트 SaaS

## Overview

FateSaju computes your Four Pillars (사주팔자) using a code-based manseryeok engine, then interprets the results with Claude AI at the level of a professional myeongrihak practitioner.

| Feature | Status |
|---------|--------|
| Manseryeok engine (4 pillars, sipseong, unseong, oheng, sinsal, daeun) | Done |
| Free report (pillar chart, oheng balance, personality summary, yearly keyword) | Done |
| Premium report (10-section AI analysis via Claude API) | Done |
| Toss Payments integration (5,900 KRW) | Done |
| Supabase Auth (magic link email login) | Done |
| Report persistence (Supabase Postgres) | Done |
| KakaoTalk share button | Done |
| Responsive UI (mobile-first, dark theme) | Done |

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Manseryeok Engine:** `lunar-javascript` + custom sipseong/unseong/sinsal/oheng logic
- **LLM:** Claude Sonnet 4.5 (Anthropic API) — parallel section generation
- **Database:** Supabase (Postgres + Auth)
- **Payments:** Toss Payments
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone <repo-url>
cd fatesaju
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For premium reports | Claude API key from console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | For auth & DB | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth & DB | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | For server-side DB | Supabase service role key |
| `TOSS_CLIENT_KEY` | For payments | Toss Payments client key |
| `TOSS_SECRET_KEY` | For payments | Toss Payments secret key |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | For KakaoTalk share | Kakao JavaScript SDK key |
| `NEXT_PUBLIC_SITE_URL` | For callbacks | Your site URL (e.g. https://fatesaju.com) |

The app works without external services — the manseryeok engine and free report run locally. Premium features (AI report, persistence, payments) require the corresponding API keys.

### Database Setup

Run the SQL migration in the Supabase SQL Editor:

```bash
# File: docs/db.sql
# Copy the contents and run in Supabase Dashboard > SQL Editor
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── input/              # Birth info input form
│   ├── report/             # Report viewer (free + premium)
│   ├── pricing/            # Pricing page
│   ├── auth/               # Login + callback
│   └── api/                # API routes
│       ├── saju/           # Calculate + report generation
│       └── payment/        # Toss Payments (create, confirm, webhook)
├── lib/
│   ├── saju/               # Manseryeok engine (core computation)
│   ├── db/                 # Supabase client + queries
│   ├── payment/            # Toss Payments integration
│   ├── auth/               # Auth helpers
│   └── utils/              # Hash, format utilities
├── components/
│   ├── report/             # PillarCard, OhengChart, DaeunTimeline, etc.
│   ├── loading/            # Loading screen with pillar flip animation
│   ├── common/             # Header
│   └── ui/                 # Button and shared UI components
└── styles/
    └── theme.ts            # Design tokens (colors, oheng palette)
```

## Key Flows

### Free Report
1. User enters birth info at `/input`
2. Client POSTs to `/api/saju/calculate` — manseryeok engine computes 4 pillars
3. Loading screen shows pillar flip animation
4. Client POSTs to `/api/saju/report` with `tier: "free"` — returns saju result + free summary
5. Redirect to `/report/[id]` — displays pillars, oheng chart, personality summary, yearly keyword

### Premium Report
1. User clicks "풀 리포트 구매하기" on report page
2. Client POSTs to `/api/payment/create` — creates Toss payment intent
3. Redirect to Toss payment widget
4. On success, Toss redirects to `/api/payment/confirm` — confirms payment, upgrades report tier
5. Report page shows all 10 sections with detailed AI analysis

### Authentication
1. User clicks "로그인" at `/auth/login`
2. Enters email — magic link sent via Supabase Auth
3. User clicks link — `/auth/callback` exchanges code for session
4. Authenticated users can view past reports

## License

Proprietary. All rights reserved.

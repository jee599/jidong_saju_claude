-- FateSaju Supabase Schema
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

-- 사용자
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz default now()
);

-- 리포트
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  saju_hash text not null,
  input_json jsonb not null,
  saju_result jsonb not null,
  report_json jsonb,
  report_type text not null default 'full',
  tier text not null default 'free',
  created_at timestamptz default now()
);

-- 인덱스
create index if not exists idx_reports_saju_hash on reports(saju_hash);
create index if not exists idx_reports_user_id on reports(user_id);

-- 결제
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  report_id uuid references reports(id),
  amount integer not null,
  currency text default 'KRW',
  provider text default 'toss',
  status text not null default 'pending',
  payment_key text,
  order_id text not null,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_payments_report_id on payments(report_id);

-- 캐시
create table if not exists report_cache (
  saju_hash text not null,
  section_key text not null,
  content jsonb not null,
  created_at timestamptz default now(),
  primary key (saju_hash, section_key)
);

-- RLS 활성화
alter table users enable row level security;
alter table reports enable row level security;
alter table payments enable row level security;

-- 서비스 역할은 모두 접근 가능 (API Routes에서 service_role key 사용)
create policy "Service role full access" on reports for all using (true);
create policy "Service role full access" on payments for all using (true);
create policy "Service role full access" on report_cache for all using (true);

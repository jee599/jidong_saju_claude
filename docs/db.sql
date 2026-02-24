-- FateSaju Database Schema (Supabase/Postgres)
-- Run this in the Supabase SQL Editor to initialize the database.

-- Enable UUID extension (usually already enabled in Supabase)
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS (extends Supabase Auth)
-- ============================================================
-- Supabase Auth already manages `auth.users`.
-- This table stores app-specific profile data linked to auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- REPORTS
-- ============================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  saju_hash text not null,
  input_json jsonb not null,
  saju_result jsonb not null,
  report_json jsonb,              -- LLM-generated report (null until generated)
  report_type text not null default 'full',  -- 'full' | 'compatibility' | 'yearly'
  tier text not null default 'free',         -- 'free' | 'premium'
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_saju_hash on public.reports(saju_hash);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  amount integer not null,
  currency text not null default 'KRW',
  provider text not null default 'toss',
  status text not null default 'pending',  -- 'pending' | 'confirmed' | 'failed' | 'cancelled'
  payment_key text,                         -- Toss paymentKey
  order_id text not null,                   -- Toss orderId
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_payment_key on public.payments(payment_key);
create index if not exists idx_payments_report_id on public.payments(report_id);

-- ============================================================
-- REPORT CACHE (LLM response cache)
-- ============================================================
create table if not exists public.report_cache (
  saju_hash text not null,
  section_key text not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  primary key (saju_hash, section_key)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.payments enable row level security;
alter table public.report_cache enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Reports: users can view their own reports; anonymous reports have null user_id
create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = user_id or user_id is null);

create policy "Anyone can insert reports"
  on public.reports for insert
  with check (true);

create policy "Service role can update reports"
  on public.reports for update
  using (true);

-- Payments: users can view their own payments
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Service role can manage payments"
  on public.payments for insert
  with check (true);

create policy "Service role can update payments"
  on public.payments for update
  using (true);

-- Cache: readable by all, writable by service role
create policy "Cache is readable"
  on public.report_cache for select
  using (true);

create policy "Cache is writable"
  on public.report_cache for insert
  with check (true);

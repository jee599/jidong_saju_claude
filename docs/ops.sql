-- ops_events: structured logging for LLM usage, rate limits, errors, payments
-- Run this migration in Supabase SQL editor

create table if not exists ops_events (
  id                 bigint generated always as identity primary key,
  event_type         text not null,          -- 'llm_usage'|'rate_limit'|'error'|'payment'
  endpoint           text not null,          -- '/api/saju/report' etc.
  tier               text,                   -- 'free'|'premium'|null
  section_count      smallint,
  input_tokens       int default 0,
  output_tokens      int default 0,
  cache_write_tokens int default 0,
  cache_read_tokens  int default 0,
  estimated_cost_usd numeric(10,6) default 0,
  status_code        smallint,               -- 200, 429, 500...
  error_code         text,
  saju_hash          text,                   -- non-reversible
  ip_hash            text,                   -- SHA-256 truncated, non-reversible
  request_id         text,
  metadata           jsonb default '{}',
  created_at         timestamptz not null default now()
);

create index if not exists idx_ops_events_created_at on ops_events (created_at desc);
create index if not exists idx_ops_events_type_created on ops_events (event_type, created_at desc);

alter table ops_events enable row level security;
-- No RLS policies: only service_role key can access (bypasses RLS)

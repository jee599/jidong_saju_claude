"use client";

import { useCallback, useEffect, useState } from "react";

// --- Types ---

interface Stats {
  totalRequests: number;
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheWriteTokens: number;
  totalCacheReadTokens: number;
  errorCount: number;
  rateLimitCount: number;
  paymentCount: number;
  errorRate: number;
  errorsByEndpoint: Record<string, { errors: number; rateLimits: number }>;
  error?: string;
}

interface OpsEvent {
  id: number;
  event_type: string;
  endpoint: string;
  tier: string | null;
  section_count: number | null;
  input_tokens: number;
  output_tokens: number;
  cache_write_tokens: number;
  cache_read_tokens: number;
  estimated_cost_usd: number;
  status_code: number | null;
  error_code: string | null;
  request_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// --- Constants ---

const TIME_RANGES = ["1h", "24h", "7d"] as const;
const TIER_OPTIONS = ["all", "free", "premium"] as const;
const REFRESH_INTERVAL = 30_000;

type TimeRange = (typeof TIME_RANGES)[number];
type TierOption = (typeof TIER_OPTIONS)[number];

// --- Helpers ---

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function badge(type: string): { label: string; className: string } {
  switch (type) {
    case "llm_usage":
      return { label: "LLM", className: "bg-blue-500/20 text-blue-400" };
    case "rate_limit":
      return { label: "429", className: "bg-amber-500/20 text-amber-400" };
    case "error":
      return { label: "ERR", className: "bg-red-500/20 text-red-400" };
    case "payment":
      return { label: "PAY", className: "bg-emerald-500/20 text-emerald-400" };
    default:
      return { label: type, className: "bg-zinc-500/20 text-zinc-400" };
  }
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// --- Component ---

export function OpsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [tier, setTier] = useState<TierOption>("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<OpsEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsOffset, setEventsOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [supabaseDown, setSupabaseDown] = useState(false);

  const fetchData = useCallback(async (resetOffset = true) => {
    const tierParam = tier === "all" ? "" : `&tier=${tier}`;
    const offset = resetOffset ? 0 : eventsOffset;
    if (resetOffset) setEventsOffset(0);

    const [statsRes, eventsRes] = await Promise.all([
      fetch(`/api/ops/stats?timeRange=${timeRange}${tierParam}`),
      fetch(`/api/ops/events?timeRange=${timeRange}${tierParam}&limit=50&offset=${offset}`),
    ]);

    if (statsRes.status === 503 || eventsRes.status === 503) {
      setSupabaseDown(true);
      setLoading(false);
      return;
    }

    setSupabaseDown(false);
    const statsData = await statsRes.json();
    const eventsData = await eventsRes.json();

    setStats(statsData);
    setEvents(eventsData.events ?? []);
    setEventsTotal(eventsData.total ?? 0);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, tier]);

  // Initial fetch + re-fetch on filter change
  useEffect(() => {
    setLoading(true);
    fetchData(true);
  }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  const loadMore = async () => {
    const newOffset = eventsOffset + 50;
    setEventsOffset(newOffset);

    const tierParam = tier === "all" ? "" : `&tier=${tier}`;
    const res = await fetch(
      `/api/ops/events?timeRange=${timeRange}${tierParam}&limit=50&offset=${newOffset}`
    );
    const data = await res.json();
    setEvents((prev) => [...prev, ...(data.events ?? [])]);
  };

  const handleLogout = async () => {
    await fetch("/api/ops/logout", { method: "POST" });
    window.location.href = "/log";
  };

  // --- Render ---

  if (supabaseDown) {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="bg-bg-elevated rounded-2xl p-8 border border-border text-center max-w-md">
          <p className="text-text-primary text-lg font-semibold mb-2">Supabase not configured</p>
          <p className="text-text-secondary text-sm">
            Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable ops logging.
          </p>
          <button onClick={handleLogout} className="mt-6 text-brand text-sm hover:underline">
            Logout
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-base text-text-primary p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Ops Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-text-secondary text-sm hover:text-text-primary transition"
        >
          Logout
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-bg-elevated rounded-lg p-1 border border-border">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                timeRange === tr
                  ? "bg-brand text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tr}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-bg-elevated rounded-lg p-1 border border-border">
          {TIER_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-3 py-1.5 rounded-md text-sm transition capitalize ${
                tier === t
                  ? "bg-brand text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && (
          <span className="text-text-tertiary text-xs animate-pulse">Refreshing...</span>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Requests" value={String(stats.totalRequests)} />
          <StatCard label="LLM Cost (USD)" value={`$${stats.totalCostUsd.toFixed(4)}`} />
          <StatCard
            label="Error Rate"
            value={`${stats.errorRate.toFixed(1)}%`}
            alert={stats.errorRate > 5}
          />
          <StatCard
            label="Rate Limit Hits"
            value={String(stats.rateLimitCount)}
            alert={stats.rateLimitCount > 0}
          />
        </div>
      )}

      {/* Token Summary */}
      {stats && stats.totalRequests > 0 && (
        <div className="bg-bg-elevated rounded-xl border border-border p-4 mb-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Token Usage</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-text-tertiary">Input</span>
              <p className="text-text-primary font-mono">{formatTokens(stats.totalInputTokens)}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Output</span>
              <p className="text-text-primary font-mono">{formatTokens(stats.totalOutputTokens)}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Cache Write</span>
              <p className="text-text-primary font-mono">{formatTokens(stats.totalCacheWriteTokens)}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Cache Read</span>
              <p className="text-text-primary font-mono">{formatTokens(stats.totalCacheReadTokens)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Errors by Endpoint */}
      {stats && Object.keys(stats.errorsByEndpoint).length > 0 && (
        <div className="bg-bg-elevated rounded-xl border border-border p-4 mb-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Errors by Endpoint</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-tertiary text-left">
                <th className="pb-2">Endpoint</th>
                <th className="pb-2 text-right">Errors</th>
                <th className="pb-2 text-right">Rate Limits</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.errorsByEndpoint).map(([ep, counts]) => (
                <tr key={ep} className="border-t border-border">
                  <td className="py-2 font-mono text-xs">{ep}</td>
                  <td className="py-2 text-right text-red-400">{counts.errors || "-"}</td>
                  <td className="py-2 text-right text-amber-400">{counts.rateLimits || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Event Log */}
      <div className="bg-bg-elevated rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">
          Event Log ({eventsTotal} total)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-tertiary text-left text-xs">
                <th className="pb-2 pr-3">Time</th>
                <th className="pb-2 pr-3">Type</th>
                <th className="pb-2 pr-3">Endpoint</th>
                <th className="pb-2 pr-3">Tier</th>
                <th className="pb-2 pr-3 text-right">Tokens (in/out)</th>
                <th className="pb-2 pr-3 text-right">Cost</th>
                <th className="pb-2 pr-3 text-right">Status</th>
                <th className="pb-2">Error Code</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const b = badge(ev.event_type);
                return (
                  <tr key={ev.id} className="border-t border-border">
                    <td className="py-2 pr-3 text-xs text-text-secondary whitespace-nowrap">
                      {formatTime(ev.created_at)}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${b.className}`}>
                        {b.label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{ev.endpoint}</td>
                    <td className="py-2 pr-3 text-xs">{ev.tier ?? "-"}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">
                      {ev.input_tokens || ev.output_tokens
                        ? `${formatTokens(ev.input_tokens)}/${formatTokens(ev.output_tokens)}`
                        : "-"}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">
                      {ev.estimated_cost_usd
                        ? `$${Number(ev.estimated_cost_usd).toFixed(4)}`
                        : "-"}
                    </td>
                    <td className="py-2 pr-3 text-right text-xs">
                      {ev.status_code ?? "-"}
                    </td>
                    <td className="py-2 text-xs text-text-tertiary">{ev.error_code ?? "-"}</td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-tertiary text-sm">
                    No events in this time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {events.length < eventsTotal && (
          <button
            onClick={loadMore}
            className="mt-4 w-full py-2 text-sm text-brand hover:text-brand-light transition"
          >
            Load more ({eventsTotal - events.length} remaining)
          </button>
        )}
      </div>
    </main>
  );
}

// --- Sub-components ---

function StatCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-bg-elevated rounded-xl border p-4 ${alert ? "border-red-500/30" : "border-border"}`}>
      <p className="text-text-tertiary text-xs mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${alert ? "text-red-400" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

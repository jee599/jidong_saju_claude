// GET /api/ops/stats — Aggregated stats from ops_events

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { getSupabaseAdmin } = await import("@/lib/db/supabase");
    const db = getSupabaseAdmin();

    const params = request.nextUrl.searchParams;
    const timeRange = params.get("timeRange") ?? "24h";
    const tier = params.get("tier"); // "free" | "premium" | null

    const now = new Date();
    const timeMap: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    };
    const ms = timeMap[timeRange] ?? timeMap["24h"];
    const since = new Date(now.getTime() - ms).toISOString();

    // Fetch all events in the time range
    let query = db
      .from("ops_events")
      .select("event_type, endpoint, status_code, estimated_cost_usd, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens")
      .gte("created_at", since);

    if (tier) {
      query = query.eq("tier", tier);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("[ops/stats] query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = events ?? [];

    // Aggregate
    const totalRequests = rows.filter((r) => r.event_type === "llm_usage").length;
    const totalCostUsd = rows
      .filter((r) => r.event_type === "llm_usage")
      .reduce((sum, r) => sum + (Number(r.estimated_cost_usd) || 0), 0);
    const totalInputTokens = rows
      .filter((r) => r.event_type === "llm_usage")
      .reduce((sum, r) => sum + (r.input_tokens || 0), 0);
    const totalOutputTokens = rows
      .filter((r) => r.event_type === "llm_usage")
      .reduce((sum, r) => sum + (r.output_tokens || 0), 0);
    const totalCacheWriteTokens = rows
      .filter((r) => r.event_type === "llm_usage")
      .reduce((sum, r) => sum + (r.cache_write_tokens || 0), 0);
    const totalCacheReadTokens = rows
      .filter((r) => r.event_type === "llm_usage")
      .reduce((sum, r) => sum + (r.cache_read_tokens || 0), 0);

    const errorCount = rows.filter((r) => r.event_type === "error").length;
    const rateLimitCount = rows.filter((r) => r.event_type === "rate_limit").length;
    const paymentCount = rows.filter((r) => r.event_type === "payment").length;

    const errorRate = totalRequests > 0 ? (errorCount / (totalRequests + errorCount)) * 100 : 0;

    // Errors by endpoint
    const errorsByEndpoint: Record<string, { errors: number; rateLimits: number }> = {};
    for (const row of rows) {
      if (row.event_type !== "error" && row.event_type !== "rate_limit") continue;
      if (!errorsByEndpoint[row.endpoint]) {
        errorsByEndpoint[row.endpoint] = { errors: 0, rateLimits: 0 };
      }
      if (row.event_type === "error") errorsByEndpoint[row.endpoint].errors++;
      if (row.event_type === "rate_limit") errorsByEndpoint[row.endpoint].rateLimits++;
    }

    return NextResponse.json({
      totalRequests,
      totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
      totalInputTokens,
      totalOutputTokens,
      totalCacheWriteTokens,
      totalCacheReadTokens,
      errorCount,
      rateLimitCount,
      paymentCount,
      errorRate: Math.round(errorRate * 100) / 100,
      errorsByEndpoint,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Missing")) {
      return NextResponse.json(
        {
          error: "Supabase not configured",
          totalRequests: 0,
          totalCostUsd: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalCacheWriteTokens: 0,
          totalCacheReadTokens: 0,
          errorCount: 0,
          rateLimitCount: 0,
          paymentCount: 0,
          errorRate: 0,
          errorsByEndpoint: {},
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

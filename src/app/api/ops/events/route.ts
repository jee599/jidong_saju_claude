// GET /api/ops/events — Query ops_events with filters

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { getSupabaseAdmin } = await import("@/lib/db/supabase");
    const db = getSupabaseAdmin();

    const params = request.nextUrl.searchParams;
    const timeRange = params.get("timeRange") ?? "24h";
    const tier = params.get("tier"); // "free" | "premium" | null (all)
    const eventType = params.get("eventType"); // "llm_usage" | "rate_limit" | "error" | "payment" | null
    const limit = Math.min(parseInt(params.get("limit") ?? "50", 10), 200);
    const offset = parseInt(params.get("offset") ?? "0", 10);

    // Time filter
    const now = new Date();
    const timeMap: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    };
    const ms = timeMap[timeRange] ?? timeMap["24h"];
    const since = new Date(now.getTime() - ms).toISOString();

    let query = db
      .from("ops_events")
      .select("*", { count: "exact" })
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (tier) {
      query = query.eq("tier", tier);
    }
    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[ops/events] query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data ?? [], total: count ?? 0 });
  } catch (err) {
    // Supabase not configured
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Missing")) {
      return NextResponse.json(
        { error: "Supabase not configured", events: [], total: 0 },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

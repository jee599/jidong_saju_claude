// src/lib/logging/opsLogger.ts — Fire-and-forget ops event logger

import { hashIP } from "./ipHash";

/** Generate a short unique request ID */
export function generateRequestId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `req_${ts}_${rand}`;
}

// --- Event types ---

interface LLMUsageEvent {
  endpoint: string;
  tier?: string;
  sectionCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  cacheWriteTokens?: number;
  cacheReadTokens?: number;
  estimatedCostUsd?: number;
  sajuHash?: string;
  ip: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

interface RateLimitEvent {
  endpoint: string;
  tier?: string;
  ip: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

interface ErrorEvent {
  endpoint: string;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  ip: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

interface PaymentEvent {
  endpoint: string;
  statusCode?: number;
  amount?: number;
  orderId?: string;
  ip: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Insert a row into ops_events. Fire-and-forget — never blocks the caller.
 */
async function insertEvent(row: Record<string, unknown>): Promise<void> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/db/supabase");
    const db = getSupabaseAdmin();
    const { error } = await db.from("ops_events").insert(row);
    if (error) {
      console.error("[opsLogger] insert error:", error.message);
    }
  } catch {
    // Supabase not configured — silently skip
  }
}

export function logLLMUsage(event: LLMUsageEvent): void {
  void (async () => {
    const ipHashed = await hashIP(event.ip);
    await insertEvent({
      event_type: "llm_usage",
      endpoint: event.endpoint,
      tier: event.tier ?? null,
      section_count: event.sectionCount ?? null,
      input_tokens: event.inputTokens ?? 0,
      output_tokens: event.outputTokens ?? 0,
      cache_write_tokens: event.cacheWriteTokens ?? 0,
      cache_read_tokens: event.cacheReadTokens ?? 0,
      estimated_cost_usd: event.estimatedCostUsd ?? 0,
      status_code: 200,
      saju_hash: event.sajuHash ?? null,
      ip_hash: ipHashed,
      request_id: event.requestId ?? null,
      metadata: event.metadata ?? {},
    });
  })();
}

export function logRateLimit(event: RateLimitEvent): void {
  void (async () => {
    const ipHashed = await hashIP(event.ip);
    await insertEvent({
      event_type: "rate_limit",
      endpoint: event.endpoint,
      tier: event.tier ?? null,
      status_code: 429,
      ip_hash: ipHashed,
      request_id: event.requestId ?? null,
      metadata: event.metadata ?? {},
    });
  })();
}

export function logError(event: ErrorEvent): void {
  void (async () => {
    const ipHashed = await hashIP(event.ip);
    await insertEvent({
      event_type: "error",
      endpoint: event.endpoint,
      status_code: event.statusCode ?? 500,
      error_code: event.errorCode ?? null,
      ip_hash: ipHashed,
      request_id: event.requestId ?? null,
      metadata: {
        ...(event.metadata ?? {}),
        error_message: event.errorMessage ?? undefined,
      },
    });
  })();
}

export function logPayment(event: PaymentEvent): void {
  void (async () => {
    const ipHashed = await hashIP(event.ip);
    await insertEvent({
      event_type: "payment",
      endpoint: event.endpoint,
      status_code: event.statusCode ?? 200,
      ip_hash: ipHashed,
      request_id: event.requestId ?? null,
      metadata: {
        ...(event.metadata ?? {}),
        amount: event.amount ?? undefined,
        order_id: event.orderId ?? undefined,
      },
    });
  })();
}

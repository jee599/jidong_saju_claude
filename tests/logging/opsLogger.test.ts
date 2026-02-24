import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateRequestId, logLLMUsage, logRateLimit, logError, logPayment } from "@/lib/logging/opsLogger";

// Mock Supabase
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

vi.mock("@/lib/db/supabase", () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

// Mock ipHash
vi.mock("@/lib/logging/ipHash", () => ({
  hashIP: vi.fn().mockResolvedValue("abc123def456abcd"),
}));

describe("generateRequestId", () => {
  it("returns a string starting with req_", () => {
    const id = generateRequestId();
    expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
  });

  it("returns unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});

describe("logLLMUsage", () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockFrom.mockClear();
  });

  it("inserts an llm_usage event", async () => {
    logLLMUsage({
      endpoint: "/api/saju/report",
      tier: "free",
      sectionCount: 4,
      inputTokens: 1000,
      outputTokens: 500,
      cacheWriteTokens: 100,
      cacheReadTokens: 200,
      estimatedCostUsd: 0.005,
      sajuHash: "saju_abc",
      ip: "127.0.0.1",
      requestId: "req_test",
    });

    // Wait for fire-and-forget async
    await new Promise((r) => setTimeout(r, 50));

    expect(mockFrom).toHaveBeenCalledWith("ops_events");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "llm_usage",
        endpoint: "/api/saju/report",
        tier: "free",
        section_count: 4,
        input_tokens: 1000,
        output_tokens: 500,
        cache_write_tokens: 100,
        cache_read_tokens: 200,
        estimated_cost_usd: 0.005,
        status_code: 200,
        saju_hash: "saju_abc",
        ip_hash: "abc123def456abcd",
        request_id: "req_test",
      })
    );
  });
});

describe("logRateLimit", () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockFrom.mockClear();
  });

  it("inserts a rate_limit event with status 429", async () => {
    logRateLimit({
      endpoint: "/api/saju/report",
      tier: "free",
      ip: "10.0.0.1",
      requestId: "req_rl",
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "rate_limit",
        endpoint: "/api/saju/report",
        status_code: 429,
        ip_hash: "abc123def456abcd",
      })
    );
  });
});

describe("logError", () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockFrom.mockClear();
  });

  it("inserts an error event with error details in metadata", async () => {
    logError({
      endpoint: "/api/saju/report",
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      errorMessage: "Something broke",
      ip: "10.0.0.1",
      requestId: "req_err",
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "error",
        endpoint: "/api/saju/report",
        status_code: 500,
        error_code: "INTERNAL_ERROR",
        metadata: expect.objectContaining({
          error_message: "Something broke",
        }),
      })
    );
  });
});

describe("logPayment", () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockFrom.mockClear();
  });

  it("inserts a payment event with amount in metadata", async () => {
    logPayment({
      endpoint: "/api/payment/create",
      statusCode: 200,
      amount: 5900,
      orderId: "FS-abc123",
      ip: "10.0.0.1",
      requestId: "req_pay",
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "payment",
        endpoint: "/api/payment/create",
        status_code: 200,
        metadata: expect.objectContaining({
          amount: 5900,
          order_id: "FS-abc123",
        }),
      })
    );
  });
});

describe("graceful fallback", () => {
  it("does not throw when Supabase is not configured", async () => {
    // Re-mock to simulate missing env vars
    vi.doMock("@/lib/db/supabase", () => ({
      getSupabaseAdmin: () => {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
      },
    }));

    // Should not throw
    expect(() => {
      logLLMUsage({
        endpoint: "/test",
        ip: "127.0.0.1",
      });
    }).not.toThrow();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashIP } from "@/lib/logging/ipHash";

describe("hashIP", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a 16-character hex string", async () => {
    const result = await hashIP("127.0.0.1");
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it("is deterministic for the same input", async () => {
    const a = await hashIP("192.168.1.1");
    const b = await hashIP("192.168.1.1");
    expect(a).toBe(b);
  });

  it("produces different hashes for different IPs", async () => {
    const a = await hashIP("10.0.0.1");
    const b = await hashIP("10.0.0.2");
    expect(a).not.toBe(b);
  });

  it("produces different hashes with different salts", async () => {
    const a = await hashIP("127.0.0.1");

    vi.stubEnv("OPS_IP_SALT", "custom-salt-abc");
    const b = await hashIP("127.0.0.1");

    expect(a).not.toBe(b);
  });

  it("handles empty IP gracefully", async () => {
    const result = await hashIP("");
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it("handles 'unknown' IP", async () => {
    const result = await hashIP("unknown");
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });
});

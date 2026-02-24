// src/lib/logging/ipHash.ts — One-way IP hashing for privacy-safe logging

/**
 * Hash an IP address using SHA-256 with an env salt, truncated to 16 hex chars.
 * Non-reversible: no raw IP is ever stored.
 */
export async function hashIP(ip: string): Promise<string> {
  const salt = process.env.OPS_IP_SALT ?? "fatesaju-default-salt";
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  const hex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16);
}

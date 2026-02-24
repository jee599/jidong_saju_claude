// src/lib/utils/hash.ts — Saju hash generation

/**
 * Generate a deterministic hash for a saju input.
 * Same birth info = same hash = cache hit.
 */
export function generateSajuHash(
  birthDate: string,
  birthTime: string,
  gender: string,
  calendarType: string
): string {
  const raw = `${birthDate}|${birthTime}|${gender}|${calendarType}`;
  // Simple hash for cache key (not cryptographic)
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `saju_${Math.abs(hash).toString(36)}`;
}

/**
 * Generate a unique order ID for Toss Payments.
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `FS-${timestamp}-${random}`;
}

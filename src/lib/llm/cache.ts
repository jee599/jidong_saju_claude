// src/lib/llm/cache.ts — 리포트 캐싱

import type { ReportSection, ReportSectionKey, ReportTier } from "@/lib/saju/types";

/**
 * 캐시 키 생성
 * 같은 생년월일+시간+성별 = 같은 사주 = 같은 리포트
 * tier별로 다른 캐시 (free는 짧은 출력, premium은 긴 출력)
 */
export function makeCacheKey(
  sajuHash: string,
  section: ReportSectionKey,
  tier: ReportTier = "premium"
): string {
  return `${sajuHash}:${tier}:${section}`;
}

// ─── 인메모리 캐시 (Vercel KV 없을 때 폴백) ───

const memoryCache = new Map<string, { data: ReportSection; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

export function getFromMemoryCache(
  sajuHash: string,
  section: ReportSectionKey,
  tier: ReportTier = "premium"
): ReportSection | null {
  const key = makeCacheKey(sajuHash, section, tier);
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setToMemoryCache(
  sajuHash: string,
  section: ReportSectionKey,
  data: ReportSection,
  tier: ReportTier = "premium"
): void {
  const key = makeCacheKey(sajuHash, section, tier);
  memoryCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── DB 캐시 (Supabase report_cache) ───

export async function getFromDbCache(
  sajuHash: string,
  section: ReportSectionKey,
  tier: ReportTier = "premium"
): Promise<ReportSection | null> {
  try {
    const { getCachedSection } = await import("@/lib/db/queries");
    const cacheKey = makeCacheKey(sajuHash, section, tier);
    const cached = await getCachedSection(cacheKey, section);
    return cached as ReportSection | null;
  } catch {
    return null;
  }
}

export async function setToDbCache(
  sajuHash: string,
  section: ReportSectionKey,
  data: ReportSection,
  tier: ReportTier = "premium"
): Promise<void> {
  try {
    const { setCachedSection } = await import("@/lib/db/queries");
    const cacheKey = makeCacheKey(sajuHash, section, tier);
    await setCachedSection(cacheKey, section, data);
  } catch {
    // DB 캐시 실패는 무시
  }
}

// ─── 통합 캐시 (메모리 → DB 순서로 조회) ───

export async function getCachedReport(
  sajuHash: string,
  section: ReportSectionKey,
  tier: ReportTier = "premium"
): Promise<ReportSection | null> {
  // 1. 메모리 캐시 확인
  const mem = getFromMemoryCache(sajuHash, section, tier);
  if (mem) return mem;

  // 2. DB 캐시 확인
  const db = await getFromDbCache(sajuHash, section, tier);
  if (db) {
    setToMemoryCache(sajuHash, section, db, tier); // 메모리에도 저장
    return db;
  }

  return null;
}

export async function setCachedReport(
  sajuHash: string,
  section: ReportSectionKey,
  data: ReportSection,
  tier: ReportTier = "premium"
): Promise<void> {
  setToMemoryCache(sajuHash, section, data, tier);
  await setToDbCache(sajuHash, section, data, tier);
}

// src/lib/saju/timeBranch.ts — Map HH:mm time to 12 earthly branch (시)

import type { Locale } from "@/lib/i18n/dictionary";

/** Korean branch labels (자시, 축시, …, 해시) */
const KO_LABELS = [
  "자시", "축시", "인시", "묘시", "진시", "사시",
  "오시", "미시", "신시", "유시", "술시", "해시",
] as const;

/** English branch labels using zodiac animal names */
const EN_LABELS = [
  "Rat hour", "Ox hour", "Tiger hour", "Rabbit hour",
  "Dragon hour", "Snake hour", "Horse hour", "Goat hour",
  "Monkey hour", "Rooster hour", "Dog hour", "Pig hour",
] as const;

/**
 * Convert an hour (0–23) to a branch index (0–11).
 *   자시 = 23:00–00:59 → index 0
 *   축시 = 01:00–02:59 → index 1
 *   …
 *   해시 = 21:00–22:59 → index 11
 */
export function hourToBranchIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0;  // 자시
  return Math.floor((hour + 1) / 2);
}

/**
 * Get the branch label for a time string (HH:mm).
 * Returns null if the time string is empty or invalid.
 */
export function getTimeBranchLabel(time: string, locale: Locale): string | null {
  if (!time) return null;

  const parts = time.split(":");
  if (parts.length < 2) return null;

  const hour = parseInt(parts[0], 10);
  if (isNaN(hour) || hour < 0 || hour > 23) return null;

  const idx = hourToBranchIndex(hour);
  return locale === "ko" ? KO_LABELS[idx] : EN_LABELS[idx];
}

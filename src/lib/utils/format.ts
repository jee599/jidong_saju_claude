// src/lib/utils/format.ts — Formatting utilities

/**
 * Format a number as Korean Won currency.
 */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

/**
 * Format a date string for Korean display.
 */
export function formatDateKR(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get the Korean zodiac animal name from jiji hanja.
 */
export function getAnimalName(jiHanja: string): string {
  const animals: Record<string, string> = {
    "子": "쥐", "丑": "소", "寅": "호랑이", "卯": "토끼",
    "辰": "용", "巳": "뱀", "午": "말", "未": "양",
    "申": "원숭이", "酉": "닭", "戌": "개", "亥": "돼지",
  };
  return animals[jiHanja] ?? "";
}

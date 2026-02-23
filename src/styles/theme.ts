// src/styles/theme.ts — 운명사주 디자인 시스템

export const colors = {
  // 기본
  primary: "#1A1147", // Deep Indigo (밤하늘)
  secondary: "#6C3CE1", // Purple (신비)
  accent: "#D4A84B", // Gold (고급, 동양적)
  background: "#0D0B1A", // Almost Black
  surface: "#1E1A3A", // Card Background
  text: "#E8E4F0", // Light Lavender
  textMuted: "#8B85A0", // Muted
  success: "#2ECC71",
  error: "#E74C3C",

  // 오행 컬러
  oheng: {
    木: "#4CAF50",
    火: "#F44336",
    土: "#FFC107",
    金: "#9E9E9E",
    水: "#2196F3",
  } as Record<string, string>,
} as const;

export type OhengElement = "木" | "火" | "土" | "金" | "水";

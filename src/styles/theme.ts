// src/styles/theme.ts — 운명사주 Soft Lavender Dark Theme

export const colors = {
  // Brand — lavender
  brand: {
    primary: "#9B7FE6",   // Pure Lavender
    secondary: "#BCA8F5", // Lavender Light
  },

  // Accent — lavender (unified)
  accent: "#9B7FE6",
  accentMuted: "#7558CC",

  // Dark backgrounds
  bg: {
    base: "#0A0810",
    elevated: "#141220",
    sunken: "#0E0C18",
  },

  // Borders
  border: {
    default: "rgba(255, 255, 255, 0.06)",
    subtle: "rgba(255, 255, 255, 0.04)",
    focus: "#9B7FE6",
  },

  // Text
  text: {
    primary: "#EEEAF8",
    secondary: "#9E96B8",
    tertiary: "#6A6284",
    inverse: "#0A0810",
  },

  // Semantic
  semantic: {
    success: "#5CC98A",
    warn: "#FBBF24",
    danger: "#F87171",
    info: "#60A5FA",
  },

  // 오행 컬러
  oheng: {
    木: "#3EBF68",
    火: "#E85A5A",
    土: "#D4AF37",
    金: "#C0C0C0",
    水: "#4A90D9",
  } as Record<string, string>,

  // Shadows
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    md: "0 4px 12px rgba(0, 0, 0, 0.2)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.25)",
    xl: "0 20px 48px rgba(0, 0, 0, 0.3)",
    brand: "0 4px 24px rgba(155,127,230,0.25)",
    accent: "0 4px 20px rgba(155,127,230,0.2)",
  },
} as const;

export type OhengElement = "木" | "火" | "土" | "金" | "水";

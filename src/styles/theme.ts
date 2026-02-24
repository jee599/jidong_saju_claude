// src/styles/theme.ts — 운명사주 디자인 시스템

export const colors = {
  // Brand
  brand: {
    primary: "#3B5BDB",   // Calm Indigo — trustworthy, premium
    secondary: "#5C7CFA", // Lighter indigo for hover / secondary
  },

  // Accent — warm amber, used sparingly for highlights & CTAs
  accent: "#E8990C",       // Amber gold — restrained, not tacky
  accentMuted: "#D4880A",  // Darker amber for hover

  // Backgrounds (dark mode)
  bg: {
    base: "#0C0F1A",       // Near-black blue-grey
    elevated: "#151928",   // Cards, surfaces
    sunken: "#0A0D16",     // Inset areas, inputs
  },

  // Borders
  border: {
    default: "rgba(255, 255, 255, 0.08)",
    subtle: "rgba(255, 255, 255, 0.04)",
    focus: "#3B5BDB",
  },

  // Text
  text: {
    primary: "#E8ECF4",    // High contrast on dark
    secondary: "#8B95A9",  // Muted / labels
    tertiary: "#5C6478",   // Disabled / hints
    inverse: "#0C0F1A",    // Text on light backgrounds
  },

  // Semantic
  semantic: {
    success: "#34D399",    // Emerald green
    warn: "#FBBF24",       // Amber
    danger: "#F87171",     // Soft red
    info: "#60A5FA",       // Sky blue
  },

  // 오행 컬러 — softer, cohesive with dark bg
  oheng: {
    木: "#34D399",  // Emerald
    火: "#F87171",  // Soft red
    土: "#FBBF24",  // Amber
    金: "#A1A1AA",  // Zinc
    水: "#60A5FA",  // Sky blue
  } as Record<string, string>,
} as const;

export type OhengElement = "木" | "火" | "土" | "金" | "水";

// src/styles/theme.ts — 운명사주 디자인 시스템 v2
// Premium, global SaaS-ready token system with light/dark support.

export const colors = {
  // Brand — refined indigo
  brand: {
    primary: "#4361EE",   // Vibrant yet sophisticated indigo
    secondary: "#6380F5", // Lighter indigo for hover states
  },

  // Accent — warm, refined gold (used sparingly)
  accent: "#C9973B",       // Sophisticated muted gold
  accentMuted: "#B8882E",  // Hover state

  // Dark mode backgrounds — desaturated, near-neutral
  bg: {
    base: "#0A0A0F",       // Deep neutral (minimal blue tint)
    elevated: "#141418",   // Cards, surfaces (subtle lift)
    sunken: "#07070B",     // Inputs, inset areas
  },

  // Light mode backgrounds
  bgLight: {
    base: "#FAFAFA",       // Clean off-white
    elevated: "#FFFFFF",   // Cards — pure white
    sunken: "#F4F4F5",    // Inputs, inset areas
  },

  // Borders — dark mode
  border: {
    default: "rgba(255, 255, 255, 0.08)",
    subtle: "rgba(255, 255, 255, 0.04)",
    focus: "#4361EE",
  },

  // Borders — light mode
  borderLight: {
    default: "rgba(0, 0, 0, 0.08)",
    subtle: "rgba(0, 0, 0, 0.04)",
    focus: "#4361EE",
  },

  // Text — dark mode
  text: {
    primary: "#EDEDF0",    // Slightly warm white
    secondary: "#8A8D9B",  // Desaturated muted
    tertiary: "#55575F",   // Hints / disabled
    inverse: "#0A0A0F",    // Text on light surfaces
  },

  // Text — light mode
  textLight: {
    primary: "#18181B",    // Near-black
    secondary: "#71717A",  // Zinc-600
    tertiary: "#A1A1AA",   // Zinc-400
    inverse: "#FAFAFA",    // Text on dark surfaces
  },

  // Semantic
  semantic: {
    success: "#34D399",    // Emerald
    warn: "#FBBF24",       // Amber
    danger: "#EF4444",     // Red
    info: "#60A5FA",       // Sky blue
  },

  // 오행 컬러 — softer, cohesive
  oheng: {
    木: "#34D399",  // Emerald
    火: "#F87171",  // Soft red
    土: "#FBBF24",  // Amber
    金: "#A1A1AA",  // Zinc
    水: "#60A5FA",  // Sky blue
  } as Record<string, string>,

  // Shadows (used inline or via CSS vars)
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    md: "0 4px 12px rgba(0, 0, 0, 0.25)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.3)",
    xl: "0 16px 48px rgba(0, 0, 0, 0.35)",
    brand: "0 4px 20px rgba(67, 97, 238, 0.2)",
    accent: "0 4px 20px rgba(201, 151, 59, 0.15)",
  },
} as const;

export type OhengElement = "木" | "火" | "土" | "金" | "水";

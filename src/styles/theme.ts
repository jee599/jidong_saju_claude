// src/styles/theme.ts — 운명사주 Design System v3
// Modern, trendy SaaS palette — violet brand + amber accent

export const colors = {
  // Brand — vibrant violet (trendy, modern)
  brand: {
    primary: "#6366F1",   // Violet-500 — modern SaaS standard
    secondary: "#818CF8", // Violet-400 — hover / lighter states
  },

  // Accent — warm amber (vibrant, premium)
  accent: "#F59E0B",       // Amber-500
  accentMuted: "#D97706",  // Amber-600 hover

  // Dark mode backgrounds — deep, clean
  bg: {
    base: "#09090B",       // Zinc-950
    elevated: "#18181B",   // Zinc-900
    sunken: "#0A0A0C",     // Deeper than base
  },

  // Light mode backgrounds
  bgLight: {
    base: "#FAFAFA",       // Zinc-50
    elevated: "#FFFFFF",   // Pure white cards
    sunken: "#F4F4F5",     // Zinc-100
  },

  // Borders — dark mode
  border: {
    default: "rgba(255, 255, 255, 0.08)",
    subtle: "rgba(255, 255, 255, 0.04)",
    focus: "#6366F1",
  },

  // Borders — light mode
  borderLight: {
    default: "rgba(0, 0, 0, 0.08)",
    subtle: "rgba(0, 0, 0, 0.04)",
    focus: "#6366F1",
  },

  // Text — dark mode
  text: {
    primary: "#FAFAFA",    // Zinc-50
    secondary: "#A1A1AA",  // Zinc-400
    tertiary: "#52525B",   // Zinc-600
    inverse: "#09090B",    // Zinc-950
  },

  // Text — light mode
  textLight: {
    primary: "#18181B",    // Zinc-900
    secondary: "#71717A",  // Zinc-500
    tertiary: "#A1A1AA",   // Zinc-400
    inverse: "#FAFAFA",    // Zinc-50
  },

  // Semantic
  semantic: {
    success: "#34D399",    // Emerald-400
    warn: "#FBBF24",       // Amber-300
    danger: "#F87171",     // Red-400
    info: "#60A5FA",       // Blue-400
  },

  // 오행 컬러 — harmonized
  oheng: {
    木: "#34D399",  // Emerald
    火: "#F87171",  // Soft red
    土: "#FBBF24",  // Amber
    金: "#A1A1AA",  // Zinc
    水: "#60A5FA",  // Sky blue
  } as Record<string, string>,

  // Shadows
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    md: "0 4px 12px rgba(0, 0, 0, 0.2)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.25)",
    xl: "0 20px 48px rgba(0, 0, 0, 0.3)",
    brand: "0 4px 24px rgba(99, 102, 241, 0.25)",
    accent: "0 4px 20px rgba(245, 158, 11, 0.2)",
  },
} as const;

export type OhengElement = "木" | "火" | "土" | "金" | "水";

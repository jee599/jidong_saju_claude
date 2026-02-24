// tests/i18n/dictionary.test.ts — i18n dictionary and locale detection tests

import { describe, it, expect } from "vitest";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

/* ─── Locale detection helper (mirrors middleware logic) ─── */
function detectLocale(country: string | null, acceptLang: string): Locale {
  if (country === "KR") return "ko";
  if (!country) {
    if (/^ko\b/.test(acceptLang) || acceptLang.includes("ko-KR")) {
      return "ko";
    }
  }
  return "en";
}

describe("i18n dictionary", () => {
  describe("structure", () => {
    it("has both ko and en locales", () => {
      expect(dictionary).toHaveProperty("ko");
      expect(dictionary).toHaveProperty("en");
    });

    it("ko and en have the same top-level keys", () => {
      const koKeys = Object.keys(dictionary.ko).sort();
      const enKeys = Object.keys(dictionary.en).sort();
      expect(koKeys).toEqual(enKeys);
    });

    it("nav keys match between locales", () => {
      const koKeys = Object.keys(dictionary.ko.nav).sort();
      const enKeys = Object.keys(dictionary.en.nav).sort();
      expect(koKeys).toEqual(enKeys);
    });

    it("input keys match between locales", () => {
      const koKeys = Object.keys(dictionary.ko.input).sort();
      const enKeys = Object.keys(dictionary.en.input).sort();
      expect(koKeys).toEqual(enKeys);
    });

    it("datePicker keys match between locales", () => {
      const koKeys = Object.keys(dictionary.ko.datePicker).sort();
      const enKeys = Object.keys(dictionary.en.datePicker).sort();
      expect(koKeys).toEqual(enKeys);
    });

    it("landing keys match between locales", () => {
      const koKeys = Object.keys(dictionary.ko.landing).sort();
      const enKeys = Object.keys(dictionary.en.landing).sort();
      expect(koKeys).toEqual(enKeys);
    });

    it("pricing keys match between locales", () => {
      const koKeys = Object.keys(dictionary.ko.pricing).sort();
      const enKeys = Object.keys(dictionary.en.pricing).sort();
      expect(koKeys).toEqual(enKeys);
    });
  });

  describe("datePicker translations", () => {
    it("ko has 7 weekday names", () => {
      expect(dictionary.ko.datePicker.weekdays).toHaveLength(7);
    });
    it("en has 7 weekday names", () => {
      expect(dictionary.en.datePicker.weekdays).toHaveLength(7);
    });
    it("ko has 12 month names", () => {
      expect(dictionary.ko.datePicker.months).toHaveLength(12);
    });
    it("en has 12 month names", () => {
      expect(dictionary.en.datePicker.months).toHaveLength(12);
    });
  });

  describe("pricing plans", () => {
    it("ko has 3 pricing plans", () => {
      expect(dictionary.ko.pricing.plans).toHaveLength(3);
    });
    it("en has 3 pricing plans", () => {
      expect(dictionary.en.pricing.plans).toHaveLength(3);
    });
    it("each plan has required fields", () => {
      for (const locale of ["ko", "en"] as const) {
        for (const plan of dictionary[locale].pricing.plans) {
          expect(plan).toHaveProperty("name");
          expect(plan).toHaveProperty("priceLabel");
          expect(plan).toHaveProperty("features");
          expect(plan).toHaveProperty("cta");
          expect(plan.features.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("FAQ entries", () => {
    it("ko has 4 FAQ entries", () => {
      expect(dictionary.ko.landing.faq).toHaveLength(4);
    });
    it("en has 4 FAQ entries", () => {
      expect(dictionary.en.landing.faq).toHaveLength(4);
    });
    it("each FAQ entry has q and a", () => {
      for (const locale of ["ko", "en"] as const) {
        for (const faq of dictionary[locale].landing.faq) {
          expect(faq.q).toBeTruthy();
          expect(faq.a).toBeTruthy();
        }
      }
    });
  });
});

describe("locale detection", () => {
  it("returns ko for KR country", () => {
    expect(detectLocale("KR", "en-US")).toBe("ko");
  });

  it("returns en for US country", () => {
    expect(detectLocale("US", "en-US")).toBe("en");
  });

  it("returns en for JP country", () => {
    expect(detectLocale("JP", "ja")).toBe("en");
  });

  it("returns ko when no country and Accept-Language starts with ko", () => {
    expect(detectLocale(null, "ko-KR,ko;q=0.9,en-US;q=0.8")).toBe("ko");
    expect(detectLocale(null, "ko")).toBe("ko");
  });

  it("returns en when no country and Accept-Language is en", () => {
    expect(detectLocale(null, "en-US,en;q=0.9")).toBe("en");
  });

  it("returns en for empty Accept-Language and no country", () => {
    expect(detectLocale(null, "")).toBe("en");
  });

  it("returns en for non-KR country even with ko Accept-Language", () => {
    // When country IS provided but not KR, country takes precedence
    expect(detectLocale("US", "ko-KR")).toBe("en");
  });
});

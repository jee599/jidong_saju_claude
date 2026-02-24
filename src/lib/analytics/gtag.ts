// src/lib/analytics/gtag.ts — Google Analytics 4 utility

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID) return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

// Custom events
type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function event({ action, category, label, value }: GTagEvent) {
  if (!GA_MEASUREMENT_ID) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// Predefined custom events for FateSaju
export const trackEvents = {
  reportGenerated: (tier: "free" | "premium") =>
    event({ action: "report_generated", category: "engagement", label: tier }),

  reportViewed: (reportId: string) =>
    event({ action: "report_viewed", category: "engagement", label: reportId }),

  inputSubmitted: () =>
    event({ action: "input_submitted", category: "engagement" }),

  paymentStarted: (productType: string) =>
    event({ action: "payment_started", category: "conversion", label: productType }),

  paymentCompleted: (amount: number) =>
    event({ action: "payment_completed", category: "conversion", value: amount }),

  compatibilityViewed: () =>
    event({ action: "compatibility_viewed", category: "engagement" }),

  yearlyViewed: () =>
    event({ action: "yearly_viewed", category: "engagement" }),

  shareClicked: (platform: string) =>
    event({ action: "share_clicked", category: "engagement", label: platform }),
};

// Global type augmentation for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

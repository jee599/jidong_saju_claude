"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";
import { useTranslations } from "@/lib/i18n/context";

export default function PricingPage() {
  const t = useTranslations();
  const p = t.pricing;

  return (
    <div className="min-h-screen bg-bg-base">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            {p.title}
          </h1>
          <p className="text-text-secondary text-sm">
            {p.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {p.plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border flex flex-col ${
                plan.highlight
                  ? "border-accent bg-gradient-to-b from-bg-elevated to-bg-base shadow-lg shadow-accent/5"
                  : "border-border bg-bg-elevated"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-accent text-text-inverse">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-lg font-bold text-text-primary mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-accent mb-6">
                {plan.priceLabel}
              </p>

              <ul className="text-sm text-text-secondary space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-success mt-0.5 shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/input"
                className={`block text-center py-3 rounded-lg font-medium transition text-sm ${
                  plan.highlight
                    ? "bg-accent text-text-inverse hover:bg-accent-hover"
                    : "bg-brand-muted text-brand-light hover:bg-brand/20"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-text-secondary">
            {p.paymentNote1}
            <br />
            {p.paymentNote2}
          </p>
        </div>
      </main>
    </div>
  );
}

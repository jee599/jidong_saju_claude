"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";
import { useTranslations } from "@/lib/i18n/context";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  const t = useTranslations();
  const l = t.landing;

  return (
    <main className="min-h-screen bg-bg-base">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-brand-light text-xs tracking-[0.2em] uppercase mb-5 font-medium"
          >
            {l.heroLabel}
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-[1.15] mb-7 tracking-tight"
          >
            {l.heroTitle1}
            <br />
            <span className="text-accent">{l.heroTitle2}</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {l.heroDesc1}
            <br className="hidden md:block" />
            {l.heroDesc2}
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            <Link
              href="/input"
              className="inline-block bg-brand text-white text-base sm:text-lg font-semibold px-10 py-4 rounded-xl hover:bg-brand-light hover:scale-[1.03] transition-all shadow-elevation-3"
            >
              {l.heroCta} &rarr;
            </Link>
            <p className="text-text-secondary text-sm mt-5">
              {l.heroSub}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 px-4 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-14 text-center">
          {[
            { value: l.statAnalysesValue, label: l.statAnalyses },
            { value: l.statRatingValue, label: l.statRating },
            { value: l.statEngineValue, label: l.statEngine },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xl sm:text-2xl font-bold text-accent">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 px-4 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary mb-4 tracking-tight">
            {l.howTitle}
          </h2>
          <p className="text-text-secondary text-center text-sm mb-14 max-w-md mx-auto">
            {l.howSub}
          </p>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                step: "01",
                title: l.step1Title,
                desc: l.step1Desc,
                icon: (
                  <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: l.step2Title,
                desc: l.step2Desc,
                icon: (
                  <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: l.step3Title,
                desc: l.step3Desc,
                icon: (
                  <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-bg-elevated rounded-2xl p-6 sm:p-8 border border-border hover:border-brand/20 transition shadow-elevation-1"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-accent text-xs font-mono font-medium">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 sm:py-24 px-4 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">
            {l.whatTitle}
          </h2>
          <p className="text-text-secondary text-sm mb-12">{l.whatSub}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title: l.personality, desc: l.personalityDesc, free: true },
              { title: l.balance, desc: l.balanceDesc, free: true },
              { title: l.yearly, desc: l.yearlyDesc, free: true },
              { title: l.lucky, desc: l.luckyDesc, free: true },
              { title: l.career, desc: l.careerDesc },
              { title: l.love, desc: l.loveDesc },
              { title: l.wealth, desc: l.wealthDesc },
              { title: l.daeun, desc: l.daeunDesc },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-xl p-4 border text-left transition shadow-elevation-1 ${
                  item.free
                    ? "bg-bg-elevated border-success/20"
                    : "bg-bg-elevated/50 border-border"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="text-sm font-bold text-text-primary">{item.title}</h4>
                  {item.free && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-medium">{l.free}</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-24 px-4 border-t border-border-subtle" id="pricing">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">
            {l.pricingTitle}
          </h2>
          <p className="text-text-secondary text-sm mb-12">
            {l.pricingSub}
          </p>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl p-6 sm:p-7 border border-border bg-bg-elevated shadow-elevation-1">
              <h3 className="text-base font-bold text-text-primary mb-1">{l.freePlanName}</h3>
              <p className="text-3xl font-bold text-accent mb-5">{l.freePlanPrice}</p>
              <ul className="text-sm text-text-secondary space-y-2.5 mb-7 text-left">
                {l.freePlanFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-success mt-0.5">&#10003;</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/input"
                className="block text-center py-3 rounded-xl text-sm font-medium bg-brand-muted text-brand-light hover:bg-brand/20 transition"
              >
                {l.freePlanCta}
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-2xl p-6 sm:p-7 border border-accent/50 bg-gradient-to-b from-bg-elevated to-bg-base relative shadow-elevation-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-text-inverse text-[10px] font-bold px-3 py-1 rounded-full">
                {l.premiumBadge}
              </span>
              <h3 className="text-base font-bold text-text-primary mb-1">{l.premiumPlanName}</h3>
              <p className="text-3xl font-bold text-accent mb-5">{l.premiumPlanPrice}</p>
              <ul className="text-sm text-text-secondary space-y-2.5 mb-7 text-left">
                {l.premiumPlanFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">&#10003;</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/input"
                className="block text-center py-3 rounded-xl text-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition shadow-elevation-1"
              >
                {l.premiumPlanCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24 px-4 border-t border-border-subtle">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-12 tracking-tight">
            {l.faqTitle}
          </h2>
          <div className="space-y-4">
            {l.faq.map((item) => (
              <div key={item.q} className="bg-bg-elevated rounded-2xl p-5 sm:p-6 border border-border shadow-elevation-1">
                <h4 className="text-sm font-bold text-text-primary mb-2">{item.q}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 px-4 border-t border-border-subtle">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-5 tracking-tight">
            {l.ctaTitle}
          </h2>
          <p className="text-sm text-text-secondary mb-10">
            {l.ctaSub}
          </p>
          <Link
            href="/input"
            className="inline-block bg-brand text-white font-semibold px-10 py-4 rounded-xl hover:bg-brand-light hover:scale-[1.03] transition-all shadow-elevation-3"
          >
            {l.heroCta} &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-4">
            <span className="text-accent font-bold">{t.brand}</span>
            <span className="text-xs">{t.tagline}</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <Link href="/auth/login" className="hover:text-text-primary transition">{l.footerLogin}</Link>
            <Link href="/pricing" className="hover:text-text-primary transition">{l.footerPricing}</Link>
            <span>&copy; 2026 FateSaju</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

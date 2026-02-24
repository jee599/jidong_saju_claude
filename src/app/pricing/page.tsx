"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";

const plans = [
  {
    name: "무료 요약",
    price: 0,
    priceLabel: "무료",
    features: [
      "사주팔자 4기둥 계산",
      "오행 밸런스 차트",
      "성격 요약 3~4문장",
      "올해 키워드 1줄",
      "신살 & 합충 정보",
      "대운 타임라인",
    ],
    cta: "무료로 시작",
    href: "/input",
    highlight: false,
  },
  {
    name: "풀 리포트",
    price: 5900,
    priceLabel: "5,900원",
    features: [
      "무료 요약 포함",
      "10개 섹션 AI 상세 분석",
      "성격 · 직업 · 연애 · 재물 · 건강",
      "가족 · 과거 · 현재 · 미래",
      "대운 타임라인 분석",
      "맞춤형 실행 팁",
    ],
    cta: "풀 리포트 받기",
    href: "/input",
    highlight: true,
    badge: "인기",
  },
  {
    name: "올인원 패키지",
    price: 14900,
    priceLabel: "14,900원",
    features: [
      "풀 리포트 포함",
      "궁합 분석 (2인)",
      "2026 연간 운세",
      "월별 운세 흐름",
      "올인원 할인 적용",
    ],
    cta: "올인원 패키지",
    href: "/input",
    highlight: false,
    badge: "최고 가성비",
  },
];

export default function PricingPage() {
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
            합리적인 가격
          </h1>
          <p className="text-text-secondary text-sm">
            무료 요약으로 시작하고, 원하면 풀 리포트를 받아보세요.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
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
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full bg-accent text-text-inverse">
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
                href={plan.href}
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
            모든 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
            <br />
            카카오페이 · 토스 · 신용카드 결제 가능
          </p>
        </div>
      </main>
    </div>
  );
}

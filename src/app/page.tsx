"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0D0B1A]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0D0B1A]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#D4A84B]">
            운명사주
          </Link>
          <nav className="flex items-center gap-6 text-sm text-[#8B85A0]">
            <Link href="/pricing" className="hover:text-[#E8E4F0] transition">
              가격
            </Link>
            <Link
              href="/input"
              className="bg-[#6C3CE1] text-white px-4 py-2 rounded-lg hover:bg-[#5A2FC0] transition"
            >
              무료로 시작
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-[#6C3CE1] text-sm tracking-widest uppercase mb-4"
          >
            AI x 명리학
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl md:text-6xl font-bold text-[#E8E4F0] leading-tight mb-6"
          >
            AI가 명리학으로 풀어내는
            <br />
            <span className="text-[#D4A84B]">당신의 운명</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg text-[#8B85A0] max-w-2xl mx-auto mb-10"
          >
            생년월일시만 입력하면, 만세력 엔진이 정확히 계산하고
            <br className="hidden md:block" />
            AI가 전문 명리학자 수준으로 해석합니다.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            <Link
              href="/input"
              className="inline-block bg-gradient-to-r from-[#6C3CE1] to-[#D4A84B] text-white text-lg font-semibold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[#6C3CE1]/25"
            >
              무료 사주 보기 →
            </Link>
            <p className="text-[#8B85A0] text-sm mt-4">
              30초면 완료 · 회원가입 불필요
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#E8E4F0] mb-16">
            어떻게 작동하나요?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "생년월일시 입력",
                desc: "양력 또는 음력, 태어난 시간까지 정확하게 입력합니다.",
              },
              {
                step: "02",
                title: "만세력 엔진 계산",
                desc: "사주팔자, 십성, 12운성, 대운, 신살을 코드로 정밀 계산합니다.",
              },
              {
                step: "03",
                title: "AI 전문 해석",
                desc: "계산 결과를 Claude AI가 명리학 전문가 수준으로 해석합니다.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-[#1E1A3A] rounded-2xl p-8 border border-white/5"
              >
                <span className="text-[#D4A84B] text-sm font-mono">
                  {item.step}
                </span>
                <h3 className="text-xl font-bold text-[#E8E4F0] mt-3 mb-3">
                  {item.title}
                </h3>
                <p className="text-[#8B85A0] text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#E8E4F0] mb-4">
            합리적인 가격
          </h2>
          <p className="text-[#8B85A0] mb-12">
            무료 요약으로 시작하고, 원하면 풀 리포트를 받아보세요.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "무료 요약",
                price: "₩0",
                features: [
                  "사주팔자 계산",
                  "오행 밸런스 차트",
                  "성격 요약 3~4문장",
                  "올해 키워드 1줄",
                ],
                cta: "무료로 시작",
                highlight: false,
              },
              {
                name: "풀 리포트",
                price: "₩5,900",
                features: [
                  "10개 섹션 상세 분석",
                  "성격·직업·연애·재물·건강",
                  "대운 타임라인",
                  "맞춤 실행 팁",
                ],
                cta: "풀 리포트 받기",
                highlight: true,
              },
              {
                name: "올인원",
                price: "₩14,900",
                features: [
                  "풀 리포트 포함",
                  "궁합 분석",
                  "2026 연간운세",
                  "월별 운세 흐름",
                ],
                cta: "올인원 패키지",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlight
                    ? "border-[#D4A84B] bg-gradient-to-b from-[#1E1A3A] to-[#0D0B1A]"
                    : "border-white/5 bg-[#1E1A3A]"
                }`}
              >
                <h3 className="text-lg font-bold text-[#E8E4F0] mb-2">
                  {plan.name}
                </h3>
                <p className="text-3xl font-bold text-[#D4A84B] mb-6">
                  {plan.price}
                </p>
                <ul className="text-sm text-[#8B85A0] space-y-3 mb-8 text-left">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[#2ECC71] mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/input"
                  className={`block text-center py-3 rounded-lg font-medium transition ${
                    plan.highlight
                      ? "bg-[#D4A84B] text-[#0D0B1A] hover:bg-[#C09A40]"
                      : "bg-[#6C3CE1]/20 text-[#6C3CE1] hover:bg-[#6C3CE1]/30"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center text-sm text-[#8B85A0]">
          <p className="text-[#D4A84B] font-bold mb-2">운명사주 FateSaju</p>
          <p>AI가 명리학으로 풀어내는 당신의 운명</p>
          <p className="mt-4">© 2026 FateSaju. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

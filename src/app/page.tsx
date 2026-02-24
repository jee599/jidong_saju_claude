"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
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
            AI x 명리학
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-[1.15] mb-7 tracking-tight"
          >
            AI가 명리학으로 풀어내는
            <br />
            <span className="text-accent">당신의 운명</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
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
              className="inline-block bg-brand text-white text-base sm:text-lg font-semibold px-10 py-4 rounded-xl hover:bg-brand-light hover:scale-[1.03] transition-all shadow-elevation-3"
            >
              무료 사주 보기 &rarr;
            </Link>
            <p className="text-text-secondary text-sm mt-5">
              30초면 완료 &middot; 회원가입 불필요
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 px-4 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-14 text-center">
          {[
            { value: "15,000+", label: "분석 완료" },
            { value: "4.8", label: "평균 만족도" },
            { value: "만세력", label: "코드 기반 정밀 계산" },
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
            어떻게 작동하나요?
          </h2>
          <p className="text-text-secondary text-center text-sm mb-14 max-w-md mx-auto">
            3단계로 정밀한 사주 분석을 받아보세요.
          </p>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                step: "01",
                title: "생년월일시 입력",
                desc: "양력 또는 음력, 태어난 시간까지 정확하게 입력합니다.",
                icon: (
                  <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "만세력 엔진 계산",
                desc: "사주팔자, 십성, 12운성, 대운, 신살을 코드로 정밀 계산합니다.",
                icon: (
                  <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "AI 전문 해석",
                desc: "계산 결과를 Claude AI가 명리학 전문가 수준으로 해석합니다.",
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
            무엇을 알 수 있나요?
          </h2>
          <p className="text-text-secondary text-sm mb-12">무료 분석만으로도 핵심을 파악할 수 있습니다.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title: "성격·기질", desc: "타고난 성향", free: true },
              { title: "오행 밸런스", desc: "에너지 분포", free: true },
              { title: "올해 운세", desc: "2026 키워드", free: true },
              { title: "행운 정보", desc: "색·방위·숫자", free: true },
              { title: "직업 적성", desc: "재능의 방향" },
              { title: "연애·결혼", desc: "배우자궁 분석" },
              { title: "재물운", desc: "금전 흐름" },
              { title: "대운 흐름", desc: "인생 로드맵" },
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
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-medium">무료</span>
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
            합리적인 가격
          </h2>
          <p className="text-text-secondary text-sm mb-12">
            무료 요약으로 시작하고, 원하면 풀 리포트를 받아보세요.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl p-6 sm:p-7 border border-border bg-bg-elevated shadow-elevation-1">
              <h3 className="text-base font-bold text-text-primary mb-1">무료 요약</h3>
              <p className="text-3xl font-bold text-accent mb-5">&#8361;0</p>
              <ul className="text-sm text-text-secondary space-y-2.5 mb-7 text-left">
                {["사주팔자 계산", "오행 밸런스 차트", "성격 요약 3~4문장", "올해 키워드 1줄", "행운의 색/방위/숫자"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-success mt-0.5">&#10003;</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/input"
                className="block text-center py-3 rounded-xl text-sm font-medium bg-brand-muted text-brand-light hover:bg-brand/20 transition"
              >
                무료로 시작
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-2xl p-6 sm:p-7 border border-accent/50 bg-gradient-to-b from-bg-elevated to-bg-base relative shadow-elevation-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-text-inverse text-[10px] font-bold px-3 py-1 rounded-full">
                BEST
              </span>
              <h3 className="text-base font-bold text-text-primary mb-1">풀 리포트</h3>
              <p className="text-3xl font-bold text-accent mb-5">&#8361;5,900</p>
              <ul className="text-sm text-text-secondary space-y-2.5 mb-7 text-left">
                {["무료 요약 전체 포함", "10개 섹션 상세 AI 분석", "성격·직업·연애·재물·건강", "대운 타임라인 해석", "맞춤 실행 팁"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">&#10003;</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/input"
                className="block text-center py-3 rounded-xl text-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition shadow-elevation-1"
              >
                풀 리포트 받기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24 px-4 border-t border-border-subtle">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-12 tracking-tight">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {[
              { q: "사주 분석이 정확한가요?", a: "만세력 엔진으로 사주팔자를 코드 기반으로 정밀 계산합니다. 계산의 정확성은 전통 만세력과 동일하며, AI가 계산 결과를 해석합니다." },
              { q: "무료 분석으로도 충분한가요?", a: "무료 분석은 사주팔자, 오행 차트, 성격 요약, 올해 키워드를 제공합니다. 상세한 직업, 연애, 재물 분석은 풀 리포트에서 확인할 수 있습니다." },
              { q: "태어난 시간을 모르면 어떻게 하나요?", a: "태어난 시간은 시주(時柱) 계산에 필요합니다. 정확한 시간을 모르면 대략적인 시간대를 입력해주세요." },
              { q: "결제는 안전한가요?", a: "토스페이먼츠를 통한 안전한 결제를 제공합니다. 카카오페이, 토스, 신용카드 등 다양한 결제 수단을 지원합니다." },
            ].map((item) => (
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
            지금 바로 시작하세요
          </h2>
          <p className="text-sm text-text-secondary mb-10">
            30초 만에 AI가 분석한 사주 리포트를 받아보세요.
          </p>
          <Link
            href="/input"
            className="inline-block bg-brand text-white font-semibold px-10 py-4 rounded-xl hover:bg-brand-light hover:scale-[1.03] transition-all shadow-elevation-3"
          >
            무료 사주 보기 &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-4">
            <span className="text-accent font-bold">운명사주</span>
            <span className="text-xs">AI가 명리학으로 풀어내는 당신의 운명</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <Link href="/auth/login" className="hover:text-text-primary transition">로그인</Link>
            <Link href="/pricing" className="hover:text-text-primary transition">가격</Link>
            <span>&copy; 2026 FateSaju</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

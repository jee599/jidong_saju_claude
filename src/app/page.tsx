"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════════ */
const ROTATING_WORDS = ["성격", "직업", "연애", "올해 운세", "타이밍"];
const TRUST_ITEMS = ["만세력 정밀 계산", "절기 경계 보정", "139개 검증 벡터", "초자시 처리"];

const OHENG_BARS = [
  { label: "木", color: "linear-gradient(to top,#2D8B4E,#3EBF68)", labelColor: "#3EBF68", h: 72, p: 32 },
  { label: "火", color: "linear-gradient(to top,#C44040,#E85A5A)", labelColor: "#E85A5A", h: 50, p: 22 },
  { label: "土", color: "linear-gradient(to top,#B8960C,#D4AF37)", labelColor: "#D4AF37", h: 38, p: 18 },
  { label: "金", color: "linear-gradient(to top,#888,#C0C0C0)", labelColor: "#C0C0C0", h: 28, p: 13 },
  { label: "水", color: "linear-gradient(to top,#2F6DB5,#4A90D9)", labelColor: "#4A90D9", h: 34, p: 15 },
];

const COMPARISON_ITEMS = [
  { label: "MBTI", count: "16가지", width: "12%" },
  { label: "별자리", count: "12가지", width: "9%" },
  { label: "혈액형", count: "4가지", width: "3%" },
];

/* ══════════════════════════════════════════════════
   Small SVG helpers
   ══════════════════════════════════════════════════ */
const ArrowSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline transition-transform group-hover:translate-x-[3px]">
    <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckSvg = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ══════════════════════════════════════════════════
   Sparkle particles (client-only to avoid hydration)
   ══════════════════════════════════════════════════ */
function SparkleField({ count }: { count: number }) {
  const [particles, setParticles] = useState<
    Array<{ left: string; top: string; size: string; dur: string; delay: string }>
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${2 + Math.random() * 2.5}px`,
        dur: `${3 + Math.random() * 4}s`,
        delay: `${Math.random() * 5}s`,
      }))
    );
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: `sparkle-fade ${p.dur} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Rotating Words in Hero h1
   ══════════════════════════════════════════════════ */
function RotatingWord() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % ROTATING_WORDS.length), 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-block relative align-bottom">
      {ROTATING_WORDS.map((w, i) => (
        <span
          key={w}
          className="lav-text lav-text-animate absolute left-0 bottom-0 whitespace-nowrap transition-all duration-500 ease-out"
          style={{
            opacity: i === idx ? 1 : 0,
            transform: i === idx ? "translateY(0)" : i === (idx - 1 + ROTATING_WORDS.length) % ROTATING_WORDS.length ? "translateY(-110%)" : "translateY(110%)",
          }}
        >
          {w}
        </span>
      ))}
      {/* invisible placeholder for width stability */}
      <span className="invisible whitespace-nowrap">올해 운세</span>
    </span>
  );
}

/* ══════════════════════════════════════════════════
   Main Landing Page
   ══════════════════════════════════════════════════ */
export default function LandingPage() {
  /* IntersectionObserver for .reveal elements */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      }),
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* Oheng bar chart animation */
  const ohengRef = useRef<HTMLDivElement>(null);
  const ohengDone = useRef(false);
  useEffect(() => {
    const el = ohengRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !ohengDone.current) {
          ohengDone.current = true;
          el.querySelectorAll<HTMLElement>("[data-h]").forEach((bar, i) => {
            setTimeout(() => { bar.style.height = bar.dataset.h + "%"; }, i * 120);
          });
          el.querySelectorAll<HTMLElement>("[data-p]").forEach((pct, i) => {
            const target = parseInt(pct.dataset.p || "0");
            setTimeout(() => {
              let c = 0;
              const iv = setInterval(() => { pct.textContent = ++c + "%"; if (c >= target) clearInterval(iv); }, 30);
            }, i * 120);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* ════════ Nav ════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between h-[60px] px-8 max-md:px-5"
        style={{ background: "rgba(10,8,16,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid var(--bdr)" }}
      >
        <Link href="/" className="flex items-center gap-2 text-[17px] font-bold no-underline" style={{ color: "var(--t1)" }}>
          <div
            className="w-[26px] h-[26px] rounded-[10px] flex items-center justify-center text-[13px] font-black"
            style={{ background: "linear-gradient(135deg, var(--lav-d), var(--lav-l))", color: "#0A0A0F" }}
          >
            命
          </div>
          운명사주
        </Link>
        <div className="flex items-center gap-[6px]">
          <a href="#pricing" className="hidden md:inline-block text-[13px] font-medium px-[14px] py-[7px] rounded-[10px] no-underline transition-all hover:bg-white/5" style={{ color: "var(--t2)" }}>가격</a>
          <Link href="/auth/login" className="hidden md:inline-block text-[13px] font-medium px-[14px] py-[7px] rounded-[10px] no-underline transition-all hover:bg-white/5" style={{ color: "var(--t2)" }}>로그인</Link>
          <Link href="/input" className="text-[13px] font-semibold px-[18px] py-[7px] rounded-full no-underline transition-all hover:brightness-110 hover:-translate-y-px" style={{ background: "var(--lav)", color: "#0A0810" }}>
            무료로 시작
          </Link>
        </div>
      </nav>

      {/* ════════ Hero ════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center overflow-hidden pt-[110px] pb-24 px-6 max-md:pt-24 max-md:pb-16 max-md:px-5">
        {/* Glow */}
        <div className="absolute pointer-events-none" style={{ top: "-250px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, var(--lav-glow) 0%, rgba(155,127,230,0.06) 40%, transparent 70%)" }} />
        <SparkleField count={15} />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-[7px] pl-2 pr-[14px] py-[5px] rounded-full text-xs font-medium relative z-[1] mb-7"
          style={{ background: "var(--lav-dim)", border: "1px solid rgba(155,127,230,0.18)", color: "var(--lav-l)", animation: "float-up 0.7s ease-out" }}
        >
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--lav-l)", animation: "pulse-dot 2s infinite", boxShadow: "0 0 8px var(--lav-l)" }} />
          Beta — 무료로 체험해 보세요
        </div>

        {/* h1 with rotating words */}
        <h1
          className="relative z-[1] max-sm:!text-[30px]"
          style={{ fontSize: "clamp(34px, 5.5vw, 58px)", fontWeight: 900, lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: "22px", animation: "float-up 0.7s ease-out 0.1s both" }}
        >
          사주가 알려주는<br />
          나의 <RotatingWord /> 이야기
        </h1>

        {/* Description */}
        <p
          className="relative z-[1]"
          style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--t2)", maxWidth: "440px", lineHeight: 1.8, marginBottom: "44px", animation: "float-up 0.7s ease-out 0.2s both" }}
        >
          생년월일시를 입력하면 만세력 엔진이 정밀하게 계산하고,{" "}
          AI가 따뜻한 언어로 당신의 운명을 풀어드려요.
        </p>

        {/* CTA */}
        <div className="relative z-[1] flex flex-col items-center gap-[14px]" style={{ animation: "float-up 0.7s ease-out 0.3s both" }}>
          <Link
            href="/input"
            className="group btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-bold no-underline transition-all hover:-translate-y-[2px]"
            style={{ background: "linear-gradient(135deg, var(--lav-d), var(--lav), var(--lav-l))", color: "#0A0810", boxShadow: "0 4px 28px rgba(155,127,230,0.35), 0 0 70px rgba(155,127,230,0.1)" }}
          >
            무료 사주 보기 <ArrowSvg />
          </Link>
          <span className="text-xs" style={{ color: "var(--t3)" }}>30초면 완료 · 회원가입 불필요</span>
        </div>

      </section>

      {/* ════════ How It Works ════════ */}
      <section className="min-h-screen flex items-center justify-center py-[110px] px-6 relative max-md:py-20 max-md:px-5 max-md:min-h-0">
        <div className="max-w-[1040px] w-full mx-auto">
          <div className="reveal">
            <div className="text-xs font-bold uppercase tracking-[0.1em] mb-[18px]" style={{ color: "var(--lav)" }}>How it works</div>
            <div className="mb-[18px] max-sm:!text-[24px]" style={{ fontSize: "clamp(26px, 4.2vw, 44px)", fontWeight: 900, lineHeight: 1.35, letterSpacing: "-0.02em" }}>
              3단계로 만나는<br /><span className="lav-text">나의 사주 리포트</span>
            </div>
          </div>

          {/* Step cards */}
          <div className="grid grid-cols-3 gap-4 mt-14 max-md:grid-cols-1 max-md:gap-3">
            {[
              { num: "01", title: "생년월일시 입력", desc: "양력 또는 음력, 태어난 시간까지 입력하면 준비 완료.", icon: <><path d="M12 8v4l3 3" stroke="#9B7FE6" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="#9B7FE6" strokeWidth="2" /></> },
              { num: "02", title: "만세력 엔진 계산", desc: "사주팔자, 십성, 12운성, 대운, 신살을 정밀 계산해요.", icon: <><rect x="3" y="3" width="18" height="18" rx="3" stroke="#9B7FE6" strokeWidth="2" /><path d="M8 12h8M12 8v8" stroke="#9B7FE6" strokeWidth="2" strokeLinecap="round" /></> },
              { num: "03", title: "AI가 풀어주는 해석", desc: "명리학 전문가 수준의 AI가 따뜻하고 상세한 리포트를 만들어요.", icon: <path d="M12 3C7 8 4 12 4 15a8 8 0 0016 0c0-3-3-7-8-12z" stroke="#9B7FE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`reveal ${i === 1 ? "reveal-d1" : i === 2 ? "reveal-d2" : ""} relative overflow-hidden p-9 max-sm:p-[26px_22px] rounded-[var(--r)] transition-all duration-300 hover:-translate-y-[3px]`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--bdr)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-h)"; e.currentTarget.style.borderColor = "rgba(155,127,230,0.16)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(155,127,230,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div className="absolute top-[14px] right-5 text-[56px] font-black leading-none" style={{ background: "linear-gradient(180deg, rgba(155,127,230,0.1), rgba(155,127,230,0.02))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{step.num}</div>
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-[22px]" style={{ background: "var(--lav-dim)", border: "1px solid rgba(155,127,230,0.08)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">{step.icon}</svg>
                </div>
                <h3 className="text-[16px] font-bold mb-[10px]">{step.title}</h3>
                <p className="text-[13.5px] leading-[1.75]" style={{ color: "var(--t2)" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Engine Trust Bar */}
          <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium" style={{ color: "var(--t3)" }}>
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span style={{ color: "var(--lav)" }}>✓</span> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Divider ════════ */}
      <div className="max-w-[1040px] mx-auto px-6"><div className="shimmer-line" /></div>

      {/* ════════ Features ════════ */}
      <section className="min-h-screen flex items-center justify-center py-[110px] px-6 relative max-md:py-20 max-md:px-5 max-md:min-h-0" style={{ background: "var(--bg-s)" }}>
        <div className="max-w-[1040px] w-full mx-auto">
          <div className="reveal">
            <div className="text-xs font-bold uppercase tracking-[0.1em] mb-[18px]" style={{ color: "var(--lav)" }}>Features</div>
            <div className="mb-[18px] max-sm:!text-[24px]" style={{ fontSize: "clamp(26px, 4.2vw, 44px)", fontWeight: 900, lineHeight: 1.35, letterSpacing: "-0.02em" }}>
              무료 분석만으로도<br />충분히 의미 있어요
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-14 max-md:grid-cols-1">
            {/* Precision Comparison — span 2 */}
            <div className="reveal col-span-2 max-md:col-span-1 grid grid-cols-2 max-md:grid-cols-1 gap-9 items-center p-9 max-sm:p-[26px_22px] rounded-[var(--r)]" style={{ background: "var(--bg-card)", border: "1px solid var(--bdr)" }}>
              <div>
                <span className="inline-block px-[10px] py-[3px] rounded-lg text-[11.5px] font-semibold mb-[14px]" style={{ background: "var(--g-dim)", color: "var(--g)" }}>무료</span>
                <h3 className="text-[18px] font-bold mb-2">당신을 설명하는 다른 방법들</h3>
                <p className="text-[13.5px] leading-[1.75]" style={{ color: "var(--t2)" }}>
                  MBTI, 별자리, 혈액형은 몇 가지 유형으로 사람을 분류하지만,
                  사주는 518,400가지 조합으로 당신만의 이야기를 풀어냅니다.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {COMPARISON_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-16 text-[13px] font-medium shrink-0" style={{ color: "var(--t3)" }}>{item.label}</span>
                    <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="h-full rounded-full" style={{ width: item.width, background: "var(--t3)" }} />
                    </div>
                    <span className="text-[12px] w-14 text-right" style={{ color: "var(--t3)" }}>{item.count}</span>
                  </div>
                ))}
                {/* Saju highlight */}
                <div className="mt-1 pt-3" style={{ borderTop: "1px solid var(--bdr)" }}>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-[13px] font-bold shrink-0 lav-text">사주팔자</span>
                    <div className="flex-1 h-[8px] rounded-full overflow-hidden" style={{ background: "rgba(155,127,230,0.1)" }}>
                      <div className="h-full rounded-full" style={{ width: "100%", background: "linear-gradient(90deg, var(--lav-d), var(--lav), var(--lav-l))" }} />
                    </div>
                    <span className="text-[12px] w-14 text-right font-bold" style={{ color: "var(--lav-l)" }}>518,400+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Oheng bar chart — span 2 */}
            <div className="reveal col-span-2 max-md:col-span-1 grid grid-cols-2 max-md:grid-cols-1 gap-9 items-center p-9 max-sm:p-[26px_22px] rounded-[var(--r)]" style={{ background: "var(--bg-card)", border: "1px solid var(--bdr)" }}>
              <div>
                <span className="inline-block px-[10px] py-[3px] rounded-lg text-[11.5px] font-semibold mb-[14px]" style={{ background: "var(--g-dim)", color: "var(--g)" }}>무료</span>
                <h3 className="text-[18px] font-bold mb-2">오행 에너지 밸런스</h3>
                <p className="text-[13.5px] leading-[1.75]" style={{ color: "var(--t2)" }}>
                  목·화·토·금·수의 비율로 나의 에너지 분포를 한눈에 파악하고, 어떤 부분을 보완하면 좋을지 알 수 있어요.
                </p>
              </div>
              <div ref={ohengRef} className="flex items-end gap-[14px] h-[150px] pt-4">
                {OHENG_BARS.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center justify-end gap-[6px]">
                    <div
                      className="w-full rounded-[10px_10px_4px_4px] transition-[height] duration-1000"
                      style={{ height: "0%", background: bar.color, transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                      data-h={bar.h}
                    />
                    <div className="text-[13px] font-bold mt-[6px]" style={{ color: bar.labelColor }}>{bar.label}</div>
                    <div className="text-[11px]" style={{ color: "var(--t3)" }} data-p={bar.p}>0%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Small feature cards */}
            {[
              { tag: "무료", tagStyle: "free", title: "성격·기질 요약", desc: "타고난 성향과 강점을 따뜻한 언어로 정리해 드려요.", delay: "reveal-d1" },
              { tag: "무료", tagStyle: "free", title: "올해 키워드", desc: "2026년 나에게 가장 중요한 흐름을 한 줄로 요약해요.", delay: "reveal-d2" },
              { tag: "프리미엄 ✦", tagStyle: "premium", title: "직업 적성 · 재물운", desc: "나에게 맞는 일의 방향과 금전 흐름을 상세 분석해요.", delay: "reveal-d1" },
              { tag: "프리미엄 ✦", tagStyle: "premium", title: "대운 타임라인", desc: "10년 단위 인생 로드맵. 어디서 기회가 오는지 알려드려요.", delay: "reveal-d2" },
            ].map((card) => (
              <div
                key={card.title}
                className={`reveal ${card.delay} p-9 max-sm:p-[26px_22px] rounded-[var(--r)] transition-all duration-300`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--bdr)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(155,127,230,0.14)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bdr)"; }}
              >
                <span
                  className="inline-block px-[10px] py-[3px] rounded-lg text-[11.5px] font-semibold mb-[14px]"
                  style={card.tagStyle === "free"
                    ? { background: "var(--g-dim)", color: "var(--g)" }
                    : { background: "var(--lav-dim)", color: "var(--lav-l)", border: "1px solid rgba(155,127,230,0.12)" }}
                >
                  {card.tag}
                </span>
                <h3 className="text-[18px] font-bold mb-2">{card.title}</h3>
                <p className="text-[13.5px] leading-[1.75]" style={{ color: "var(--t2)" }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Divider ════════ */}
      <div className="max-w-[1040px] mx-auto px-6"><div className="shimmer-line" /></div>

      {/* ════════ Pricing ════════ */}
      <section id="pricing" className="min-h-screen flex items-center justify-center py-[110px] px-6 relative max-md:py-20 max-md:px-5 max-md:min-h-0">
        <div className="max-w-[1040px] w-full mx-auto">
          <div className="reveal">
            <div className="text-xs font-bold uppercase tracking-[0.1em] mb-[18px]" style={{ color: "var(--lav)" }}>Pricing</div>
            <div className="mb-[18px] max-sm:!text-[24px]" style={{ fontSize: "clamp(26px, 4.2vw, 44px)", fontWeight: 900, lineHeight: 1.35, letterSpacing: "-0.02em" }}>
              부담 없이 시작하고,<br />마음에 들면 <span className="lav-text">더 깊이</span>
            </div>
            <p className="max-w-[480px]" style={{ fontSize: "clamp(14px, 1.8vw, 17px)", color: "var(--t2)", lineHeight: 1.8 }}>
              무료 요약만으로도 충분히 유용해요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-14 max-w-[720px] max-md:grid-cols-1">
            {/* Free plan */}
            <div className="reveal reveal-d1 p-9 max-sm:p-[26px_22px] rounded-[var(--r)] relative transition-all duration-300" style={{ background: "var(--bg-card)", border: "1px solid var(--bdr)" }}>
              <h3 className="text-[16px] font-bold mb-[6px]">무료 요약</h3>
              <div className="text-[34px] font-black mb-[6px]">₩0</div>
              <div className="text-xs mb-7" style={{ color: "var(--t3)" }}>영구 무료</div>
              <ul className="flex flex-col gap-3 mb-7 list-none p-0">
                {["사주팔자 계산", "오행 밸런스 차트", "성격 요약", "올해 키워드", "행운의 색·방위·숫자"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13.5px]" style={{ color: "var(--t2)" }}>
                    <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--g-dim)", color: "var(--g)" }}><CheckSvg /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/input" className="block w-full py-[13px] text-center rounded-[14px] text-[14px] font-semibold no-underline transition-all hover:bg-white/[0.07]" style={{ background: "rgba(255,255,255,0.04)", color: "var(--t1)", border: "1px solid var(--bdr)" }}>
                무료로 시작
              </Link>
            </div>

            {/* Premium plan */}
            <div className="reveal reveal-d2 premium-card p-9 max-sm:p-[26px_22px] rounded-[var(--r)] relative transition-all duration-300">
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 px-[14px] py-1 rounded-full text-[11.5px] font-bold z-[1]" style={{ background: "linear-gradient(135deg, var(--lav), var(--lav-l))", color: "#0A0810", boxShadow: "0 2px 12px rgba(155,127,230,0.3)" }}>
                ✦ BEST
              </div>
              <h3 className="text-[16px] font-bold mb-[6px]">풀 리포트</h3>
              <div className="text-[34px] font-black mb-[6px] lav-text">₩5,900</div>
              <div className="text-xs mb-7" style={{ color: "var(--t3)" }}>1회 결제 · 영구 보관</div>
              <ul className="flex flex-col gap-3 mb-7 list-none p-0">
                {["무료 요약 전체 포함", "10개 섹션 상세 AI 분석", "성격·직업·연애·재물·건강", "대운 타임라인 해석", "맞춤 실행 팁"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13.5px]" style={{ color: "var(--t2)" }}>
                    <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--lav-dim)", color: "var(--lav-l)" }}><CheckSvg /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/input"
                className="btn-lav block w-full py-[13px] text-center rounded-[14px] text-[14px] font-semibold no-underline transition-all hover:-translate-y-[2px]"
                style={{ background: "linear-gradient(135deg, var(--lav-d), var(--lav), var(--lav-l))", color: "#0A0810", boxShadow: "0 4px 18px rgba(155,127,230,0.2)" }}
              >
                풀 리포트 받기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Beta Feedback ════════ */}
      <section className="min-h-screen flex items-center justify-center py-[110px] px-6 relative max-md:py-20 max-md:px-5 max-md:min-h-0" style={{ background: "var(--bg-s)" }}>
        <div className="max-w-[1040px] w-full mx-auto">
          <div className="reveal">
            <div className="text-xs font-bold uppercase tracking-[0.1em] mb-[18px]" style={{ color: "var(--lav)" }}>Beta Feedback</div>
            <div className="mb-[18px] max-sm:!text-[24px]" style={{ fontSize: "clamp(26px, 4.2vw, 44px)", fontWeight: 900, lineHeight: 1.35, letterSpacing: "-0.02em" }}>
              여러분의 이야기를 들려주세요
            </div>
            <p className="max-w-[480px]" style={{ fontSize: "clamp(14px, 1.8vw, 17px)", color: "var(--t2)", lineHeight: 1.8 }}>
              피드백을 보내주시면 이곳에 소개됩니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-14 max-md:grid-cols-1 max-md:gap-3">
            {[
              "첫 번째 리뷰의\n주인공이 되어주세요",
              "사주 분석을 받고\n후기를 남겨주세요",
              "여러분의 피드백이\n서비스를 만들어요",
            ].map((text, i) => (
              <div
                key={i}
                className={`reveal ${i === 1 ? "reveal-d1" : i === 2 ? "reveal-d2" : ""} min-h-[170px] flex flex-col items-center justify-center text-center p-7 rounded-[var(--r)]`}
                style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
              >
                <div className="text-[26px] mb-[10px] opacity-[0.22]">💬</div>
                <p className="text-[13.5px] leading-[1.6] whitespace-pre-line" style={{ color: "var(--t3)" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Final CTA ════════ */}
      <section className="relative min-h-[60svh] flex items-center justify-center text-center py-24 px-6 overflow-hidden max-md:py-20 max-md:px-5">
        {/* Glow */}
        <div className="absolute pointer-events-none" style={{ bottom: "-120px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, var(--lav-glow) 0%, transparent 60%)" }} />
        <SparkleField count={8} />

        <div className="reveal relative z-[1]">
          <h2 className="max-sm:!text-[28px]" style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 900, lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: "18px" }}>
            지금, <span className="lav-text">나의 사주</span>를<br />만나보세요
          </h2>
          <p className="text-[17px] mb-9" style={{ color: "var(--t2)" }}>30초면 완료돼요.</p>
          <Link
            href="/input"
            className="group btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-bold no-underline transition-all hover:-translate-y-[2px]"
            style={{ background: "linear-gradient(135deg, var(--lav-d), var(--lav), var(--lav-l))", color: "#0A0810", boxShadow: "0 4px 28px rgba(155,127,230,0.35), 0 0 70px rgba(155,127,230,0.1)" }}
          >
            무료 사주 보기 <ArrowSvg />
          </Link>
        </div>
      </section>

      {/* ════════ Footer ════════ */}
      <footer className="py-9 px-6 text-center" style={{ borderTop: "1px solid var(--bdr)" }}>
        <p className="text-xs" style={{ color: "var(--t3)" }}>© 2026 운명사주 · AI가 명리학으로 풀어내는 당신의 운명</p>
      </footer>
    </main>
  );
}

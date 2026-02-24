"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";
import { DateInput } from "@/components/input/DateInput";

export default function InputPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    gender: "" as "male" | "female" | "",
    calendarType: "solar" as "solar" | "lunar",
  });
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = form.birthDate && form.birthTime && form.gender && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const params = new URLSearchParams({
      name: form.name,
      date: form.birthDate,
      time: form.birthTime,
      gender: form.gender,
      calendar: form.calendarType,
    });
    router.push(`/report/new?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Header />

      <main className="flex items-center justify-center px-4 pt-24 pb-12 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 tracking-tight">
              사주 정보 입력
            </h1>
            <p className="text-text-secondary text-sm">
              정확한 분석을 위해 태어난 시간까지 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이름 */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                이름 <span className="text-text-tertiary">(선택)</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30 transition text-sm"
              />
            </div>

            {/* 양력/음력 */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">달력 유형</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "solar", label: "양력 (Solar)" },
                  { value: "lunar", label: "음력 (Lunar)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, calendarType: opt.value as "solar" | "lunar" })}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      form.calendarType === opt.value
                        ? "bg-brand text-white shadow-elevation-1"
                        : "bg-bg-elevated text-text-secondary border border-border hover:border-brand/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">생년월일</label>
              <DateInput
                value={form.birthDate}
                onChange={(v) => setForm({ ...form, birthDate: v })}
                className="w-full text-sm"
                required
              />
            </div>

            {/* 태어난 시간 */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">태어난 시간</label>
              <input
                type="time"
                required
                value={form.birthTime}
                onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30 transition text-sm"
              />
              <p className="text-[10px] text-text-tertiary mt-1.5">
                정확한 시간을 모르면 대략적인 시간을 입력해주세요
              </p>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">성별</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "male", label: "남성 (Male)" },
                  { value: "female", label: "여성 (Female)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, gender: opt.value as "male" | "female" })}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      form.gender === opt.value
                        ? "bg-brand text-white shadow-elevation-1"
                        : "bg-bg-elevated text-text-secondary border border-border hover:border-brand/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 제출 */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-brand-light hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-elevation-2 text-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  분석 시작 중...
                </span>
              ) : (
                "무료 사주 분석 시작 →"
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-text-tertiary mt-8">
            입력한 정보는 사주 계산에만 사용되며 안전하게 보호됩니다.
          </p>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-text-secondary hover:text-text-primary transition">
              &larr; 홈으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/common/Header";
import { DateInput } from "@/components/input/DateInput";
import { useTranslations } from "@/lib/i18n/context";

export default function InputPage() {
  const router = useRouter();
  const t = useTranslations();
  const inp = t.input;

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
              {inp.title}
            </h1>
            <p className="text-text-secondary text-sm">
              {inp.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                {inp.nameLabel} <span className="text-text-tertiary">{inp.nameOptional}</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={inp.namePlaceholder}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30 transition text-sm"
              />
            </div>

            {/* Calendar type */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">{inp.calendarLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "solar", label: inp.solar },
                  { value: "lunar", label: inp.lunar },
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

            {/* Birth date */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">{inp.birthDateLabel}</label>
              <DateInput
                value={form.birthDate}
                onChange={(v) => setForm({ ...form, birthDate: v })}
                className="w-full text-sm"
                required
              />
            </div>

            {/* Birth time */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">{inp.birthTimeLabel}</label>
              <input
                type="time"
                required
                value={form.birthTime}
                onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30 transition text-sm"
              />
              <p className="text-[10px] text-text-tertiary mt-1.5">
                {inp.birthTimeHint}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">{inp.genderLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "male", label: inp.male },
                  { value: "female", label: inp.female },
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

            {/* Submit */}
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
                  {inp.submitting}
                </span>
              ) : (
                inp.submit
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-text-tertiary mt-8">
            {inp.privacy}
          </p>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-text-secondary hover:text-text-primary transition">
              {inp.backHome}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

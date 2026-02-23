"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InputPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    gender: "" as "male" | "female" | "",
    calendarType: "solar" as "solar" | "lunar",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출 → 리포트 페이지로 이동
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
    <main className="min-h-screen bg-[#0D0B1A] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#E8E4F0] text-center mb-2">
          사주 정보 입력
        </h1>
        <p className="text-[#8B85A0] text-center mb-8 text-sm">
          정확한 분석을 위해 태어난 시간까지 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm text-[#8B85A0] mb-2">
              이름 (선택)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="홍길동"
              className="w-full bg-[#1E1A3A] border border-white/10 rounded-lg px-4 py-3 text-[#E8E4F0] placeholder:text-[#8B85A0]/50 focus:border-[#6C3CE1] focus:outline-none transition"
            />
          </div>

          {/* 양력/음력 */}
          <div>
            <label className="block text-sm text-[#8B85A0] mb-2">
              달력 유형
            </label>
            <div className="flex gap-3">
              {[
                { value: "solar", label: "양력" },
                { value: "lunar", label: "음력" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      calendarType: opt.value as "solar" | "lunar",
                    })
                  }
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${
                    form.calendarType === opt.value
                      ? "bg-[#6C3CE1] text-white"
                      : "bg-[#1E1A3A] text-[#8B85A0] border border-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm text-[#8B85A0] mb-2">
              생년월일
            </label>
            <input
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full bg-[#1E1A3A] border border-white/10 rounded-lg px-4 py-3 text-[#E8E4F0] focus:border-[#6C3CE1] focus:outline-none transition"
            />
          </div>

          {/* 태어난 시간 */}
          <div>
            <label className="block text-sm text-[#8B85A0] mb-2">
              태어난 시간
            </label>
            <input
              type="time"
              required
              value={form.birthTime}
              onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
              className="w-full bg-[#1E1A3A] border border-white/10 rounded-lg px-4 py-3 text-[#E8E4F0] focus:border-[#6C3CE1] focus:outline-none transition"
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm text-[#8B85A0] mb-2">성별</label>
            <div className="flex gap-3">
              {[
                { value: "male", label: "남성" },
                { value: "female", label: "여성" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      gender: opt.value as "male" | "female",
                    })
                  }
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${
                    form.gender === opt.value
                      ? "bg-[#6C3CE1] text-white"
                      : "bg-[#1E1A3A] text-[#8B85A0] border border-white/10"
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
            disabled={!form.birthDate || !form.birthTime || !form.gender}
            className="w-full bg-gradient-to-r from-[#6C3CE1] to-[#D4A84B] text-white font-semibold py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            무료 사주 분석 시작 →
          </button>
        </form>
      </div>
    </main>
  );
}

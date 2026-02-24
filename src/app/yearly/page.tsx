// src/app/yearly/page.tsx — 연간 운세 입력 페이지

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/Button";

export default function YearlyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [year] = useState(2026);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!birthDate || !birthTime) {
      setError("생년월일시를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/yearly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { name, birthDate, birthTime, gender, calendarType },
          year,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "연간 운세 분석에 실패했습니다.");
      }

      const result = await res.json();
      sessionStorage.setItem("yearly_result", JSON.stringify(result));
      router.push("/yearly/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B1A]">
      <Header />
      <main className="max-w-md mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E8E4F0] mb-2">{year}년 연간 운세</h1>
          <p className="text-sm text-[#8B85A0]">월별 운세 흐름을 분석합니다</p>
          <p className="text-xs text-[#D4A84B] mt-1">4,900원</p>
        </motion.div>

        <div className="bg-[#1E1A3A] rounded-2xl p-5 border border-white/5 space-y-4 mb-6">
          <input
            type="text"
            placeholder="이름 (선택)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0D0B1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E8E4F0] placeholder-[#8B85A0]/50 focus:border-[#6C3CE1] focus:outline-none"
          />
          <div>
            <label className="text-xs text-[#8B85A0] block mb-1">생년월일</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-[#0D0B1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E8E4F0] focus:border-[#6C3CE1] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-[#8B85A0] block mb-1">태어난 시간</label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full bg-[#0D0B1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E8E4F0] focus:border-[#6C3CE1] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2.5 rounded-lg text-sm transition ${
                  gender === g
                    ? "bg-[#6C3CE1] text-white"
                    : "bg-[#0D0B1A] text-[#8B85A0] border border-white/10"
                }`}
              >
                {g === "male" ? "남성" : "여성"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["solar", "lunar"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCalendarType(t)}
                className={`flex-1 py-2 rounded-lg text-xs transition ${
                  calendarType === t
                    ? "bg-[#6C3CE1]/20 text-[#6C3CE1]"
                    : "bg-[#0D0B1A] text-[#8B85A0] border border-white/10"
                }`}
              >
                {t === "solar" ? "양력" : "음력"}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#E74C3C] text-sm text-center mb-4">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button variant="gold" size="lg" className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "분석 중..." : `${year}년 운세 분석하기`}
        </Button>
      </main>
      <Footer />
    </div>
  );
}

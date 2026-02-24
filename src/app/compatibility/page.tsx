// src/app/compatibility/page.tsx — 궁합 분석 입력 페이지

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/Button";

interface PersonInput {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
}

const emptyPerson: PersonInput = {
  name: "",
  birthDate: "",
  birthTime: "",
  gender: "male",
  calendarType: "solar",
};

export default function CompatibilityPage() {
  const router = useRouter();
  const [personA, setPersonA] = useState<PersonInput>({ ...emptyPerson, name: "" });
  const [personB, setPersonB] = useState<PersonInput>({ ...emptyPerson, name: "", gender: "female" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!personA.birthDate || !personA.birthTime || !personB.birthDate || !personB.birthTime) {
      setError("두 사람의 생년월일시를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personA, personB }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "궁합 분석에 실패했습니다.");
      }

      const result = await res.json();
      sessionStorage.setItem("compatibility_result", JSON.stringify(result));
      router.push("/compatibility/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const PersonForm = ({
    label,
    person,
    setPerson,
  }: {
    label: string;
    person: PersonInput;
    setPerson: (p: PersonInput) => void;
  }) => (
    <div className="bg-[#1E1A3A] rounded-2xl p-5 border border-white/5">
      <h3 className="text-sm font-bold text-[#D4A84B] mb-4">{label}</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="이름 (선택)"
          value={person.name}
          onChange={(e) => setPerson({ ...person, name: e.target.value })}
          className="w-full bg-[#0D0B1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E8E4F0] placeholder-[#8B85A0]/50 focus:border-[#6C3CE1] focus:outline-none"
        />
        <input
          type="date"
          value={person.birthDate}
          onChange={(e) => setPerson({ ...person, birthDate: e.target.value })}
          className="w-full bg-[#0D0B1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E8E4F0] focus:border-[#6C3CE1] focus:outline-none"
        />
        <input
          type="time"
          value={person.birthTime}
          onChange={(e) => setPerson({ ...person, birthTime: e.target.value })}
          className="w-full bg-[#0D0B1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E8E4F0] focus:border-[#6C3CE1] focus:outline-none"
        />
        <div className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setPerson({ ...person, gender: g })}
              className={`flex-1 py-2 rounded-lg text-sm transition ${
                person.gender === g
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
              onClick={() => setPerson({ ...person, calendarType: t })}
              className={`flex-1 py-2 rounded-lg text-xs transition ${
                person.calendarType === t
                  ? "bg-[#6C3CE1]/20 text-[#6C3CE1]"
                  : "bg-[#0D0B1A] text-[#8B85A0] border border-white/10"
              }`}
            >
              {t === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0B1A]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E8E4F0] mb-2">궁합 분석</h1>
          <p className="text-sm text-[#8B85A0]">두 사람의 사주를 비교하여 궁합을 분석합니다</p>
          <p className="text-xs text-[#D4A84B] mt-1">7,900원</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <PersonForm label="첫 번째 사람" person={personA} setPerson={setPersonA} />
          <PersonForm label="두 번째 사람" person={personB} setPerson={setPersonB} />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#E74C3C] text-sm text-center mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "분석 중..." : "궁합 분석하기"}
        </Button>
      </main>
      <Footer />
    </div>
  );
}

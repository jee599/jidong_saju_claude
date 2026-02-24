// src/app/compatibility/page.tsx — 궁합 분석 입력 페이지

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/input/DateInput";

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
    <div className="bg-bg-elevated rounded-2xl p-5 border border-border">
      <h3 className="text-sm font-bold text-accent mb-4">{label}</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="이름 (선택)"
          value={person.name}
          onChange={(e) => setPerson({ ...person, name: e.target.value })}
          className="w-full bg-bg-sunken border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:border-brand focus:outline-none"
        />
        <DateInput
          value={person.birthDate}
          onChange={(v) => setPerson({ ...person, birthDate: v })}
          className="w-full text-sm !bg-bg-sunken !rounded-lg !px-3 !py-2.5"
        />
        <input
          type="time"
          value={person.birthTime}
          onChange={(e) => setPerson({ ...person, birthTime: e.target.value })}
          className="w-full bg-bg-sunken border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-brand focus:outline-none"
        />
        <div className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setPerson({ ...person, gender: g })}
              className={`flex-1 py-2 rounded-lg text-sm transition ${
                person.gender === g
                  ? "bg-brand text-white"
                  : "bg-bg-sunken text-text-secondary border border-border"
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
                  ? "bg-brand-muted text-brand-light"
                  : "bg-bg-sunken text-text-secondary border border-border"
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
    <div className="min-h-screen bg-bg-base">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">궁합 분석</h1>
          <p className="text-sm text-text-secondary">두 사람의 사주를 비교하여 궁합을 분석합니다</p>
          <p className="text-xs text-accent mt-1">7,900원</p>
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
              className="text-danger text-sm text-center mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          variant="accent"
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

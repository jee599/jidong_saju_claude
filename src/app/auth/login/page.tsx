"use client";

import { useState } from "react";
import Link from "next/link";
import { sendMagicLink } from "@/lib/auth/helpers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await sendMagicLink(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    } catch {
      setError("로그인 링크 발송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0B1A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-2xl font-bold text-[#D4A84B] mb-8">
          운명사주
        </Link>

        {sent ? (
          <div className="bg-[#1E1A3A] rounded-2xl p-8 border border-white/5 text-center">
            <div className="w-16 h-16 bg-[#6C3CE1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#6C3CE1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#E8E4F0] mb-2">
              이메일을 확인해주세요
            </h2>
            <p className="text-[#8B85A0] text-sm mb-1">
              <span className="text-[#E8E4F0] font-medium">{email}</span>
            </p>
            <p className="text-[#8B85A0] text-sm">
              로 로그인 링크를 보냈습니다.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-[#6C3CE1] text-sm hover:underline"
            >
              다른 이메일로 시도
            </button>
          </div>
        ) : (
          <div className="bg-[#1E1A3A] rounded-2xl p-8 border border-white/5">
            <h2 className="text-xl font-bold text-[#E8E4F0] text-center mb-2">
              로그인
            </h2>
            <p className="text-[#8B85A0] text-sm text-center mb-6">
              이메일로 간편하게 로그인하세요.
              <br />
              이전 리포트를 다시 볼 수 있습니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="w-full bg-[#0D0B1A] border border-white/10 rounded-lg px-4 py-3 text-[#E8E4F0] placeholder:text-[#8B85A0]/50 focus:border-[#6C3CE1] focus:outline-none transition text-sm"
                />
              </div>

              {error && (
                <p className="text-[#E74C3C] text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#6C3CE1] text-white font-medium py-3 rounded-lg hover:bg-[#5A2FC0] transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "발송 중..." : "로그인 링크 받기"}
              </button>
            </form>

            <p className="text-[#8B85A0] text-xs text-center mt-6">
              회원가입 없이 이메일만으로 로그인됩니다.
              <br />
              처음이시면 자동으로 계정이 생성됩니다.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="block text-center text-[#8B85A0] text-sm mt-6 hover:text-[#E8E4F0] transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

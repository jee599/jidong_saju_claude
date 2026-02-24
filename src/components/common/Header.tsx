"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/db/supabase";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const supabase = getSupabaseBrowser();
      supabase.auth.getUser().then(({ data }) => {
        if (mounted) setUser(data.user);
      });
    } catch {
      // Supabase not configured
    }
    return () => { mounted = false; };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0D0B1A]/80 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[#D4A84B]">
          운명사주
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/pricing" className="text-[#8B85A0] hover:text-[#E8E4F0] transition">
            가격
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[#8B85A0] text-xs truncate max-w-[120px]">
                {user.email}
              </span>
              <Link
                href="/input"
                className="bg-[#6C3CE1] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#5A2FC0] transition"
              >
                사주 분석
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-[#8B85A0] hover:text-[#E8E4F0] transition"
              >
                로그인
              </Link>
              <Link
                href="/input"
                className="bg-[#6C3CE1] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#5A2FC0] transition"
              >
                무료로 시작
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-[#8B85A0]"
          aria-label="메뉴"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#0D0B1A] border-b border-white/5 px-4 py-4 space-y-3">
          <Link
            href="/pricing"
            onClick={() => setMenuOpen(false)}
            className="block text-sm text-[#8B85A0] hover:text-[#E8E4F0]"
          >
            가격
          </Link>
          {!user && (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-[#8B85A0] hover:text-[#E8E4F0]"
            >
              로그인
            </Link>
          )}
          <Link
            href="/input"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-[#6C3CE1] text-white py-2.5 rounded-lg text-sm"
          >
            {user ? "사주 분석" : "무료로 시작"}
          </Link>
        </div>
      )}
    </header>
  );
}

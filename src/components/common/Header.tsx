"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/db/supabase";
import { useTranslations } from "@/lib/i18n/context";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const t = useTranslations();
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
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-bg-base/70 border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-accent tracking-tight">
          {t.brand}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition">
            {t.nav.pricing}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-text-secondary text-xs truncate max-w-[120px]">
                {user.email}
              </span>
              <Link
                href="/input"
                className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-brand-light transition shadow-elevation-1"
              >
                {t.nav.analyze}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-text-secondary hover:text-text-primary transition"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/input"
                className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-brand-light transition shadow-elevation-1"
              >
                {t.nav.startFree}
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-text-secondary"
          aria-label={t.nav.menu}
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
        <div className="sm:hidden bg-bg-base/95 backdrop-blur-xl border-b border-border-subtle px-4 py-4 space-y-3">
          <Link
            href="/pricing"
            onClick={() => setMenuOpen(false)}
            className="block text-sm text-text-secondary hover:text-text-primary"
          >
            {t.nav.pricing}
          </Link>
          {!user && (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-text-secondary hover:text-text-primary"
            >
              {t.nav.login}
            </Link>
          )}
          <Link
            href="/input"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-brand text-white py-2.5 rounded-xl text-sm font-medium"
          >
            {user ? t.nav.analyze : t.nav.startFree}
          </Link>
        </div>
      )}
    </header>
  );
}

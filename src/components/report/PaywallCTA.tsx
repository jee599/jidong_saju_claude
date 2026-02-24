"use client";

import { motion } from "framer-motion";

interface PaywallCTAProps {
  onPurchase: () => void;
  loading?: boolean;
}

export function PaywallCTA({ onPurchase, loading }: PaywallCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-bg-elevated to-bg-base rounded-2xl p-6 sm:p-8 border border-accent/20 text-center shadow-elevation-2"
    >
      <div className="w-14 h-14 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-2">
        상세 분석 잠금 해제
      </h3>
      <p className="text-sm text-text-secondary mb-1">
        10개 섹션의 전문 명리학 분석을 확인하세요.
      </p>
      <p className="text-sm text-text-secondary mb-6">
        성격, 직업, 연애, 재물, 건강, 대운 타임라인 등
      </p>

      <div className="mb-6">
        <span className="text-3xl font-bold text-accent">5,900</span>
        <span className="text-lg text-text-secondary ml-1">원</span>
      </div>

      <button
        onClick={onPurchase}
        disabled={loading}
        className="w-full bg-accent text-text-inverse font-semibold py-4 rounded-xl hover:bg-accent-hover hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-elevation-1"
      >
        {loading ? "결제 준비 중..." : "풀 리포트 구매하기"}
      </button>

      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-text-secondary">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          토스페이먼츠 결제
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          즉시 확인 가능
        </span>
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ErrorFallbackProps {
  error: string;
  code?: string | null;
  retryAfter?: number | null;
  onRetry?: () => void;
}

export function ErrorFallback({ error, code, retryAfter, onRetry }: ErrorFallbackProps) {
  const isRateLimited = code === "RATE_LIMITED";
  const isNotFound = code === "REPORT_NOT_FOUND";

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div className="text-4xl mb-4">
          {isRateLimited ? "🕐" : isNotFound ? "🔍" : "⚠️"}
        </div>
        <p className="text-text-primary text-sm mb-2">{error}</p>

        {isRateLimited && retryAfter && (
          <p className="text-text-secondary text-xs mb-4">
            {retryAfter}초 후에 다시 시도할 수 있습니다.
          </p>
        )}

        <div className="flex flex-col items-center gap-2 mt-4">
          {onRetry && !isNotFound && (
            <button
              onClick={onRetry}
              disabled={isRateLimited}
              className="text-brand-light text-sm hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다시 시도하기
            </button>
          )}
          <Link href="/input" className="text-text-secondary text-xs hover:text-text-primary transition">
            새로 분석하기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

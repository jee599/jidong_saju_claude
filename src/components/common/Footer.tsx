// src/components/common/Footer.tsx

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-bg-base border-t border-border-subtle py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <Link href="/" className="text-accent font-bold">
              운명사주
            </Link>
            <p className="text-xs text-text-secondary mt-1">
              AI가 명리학으로 풀어내는 당신의 운명
            </p>
          </div>

          <nav className="flex items-center gap-4 text-xs text-text-secondary">
            <Link href="/input" className="hover:text-text-primary transition">
              사주 분석
            </Link>
            <Link href="/pricing" className="hover:text-text-primary transition">
              가격
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle text-center">
          <p className="text-[10px] text-text-secondary">
            본 서비스의 사주 분석은 명리학에 기반한 참고 정보이며, 의료·법률·투자 조언이 아닙니다.
          </p>
          <p className="text-[10px] text-text-secondary mt-1">
            &copy; {new Date().getFullYear()} FateSaju. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

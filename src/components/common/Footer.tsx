// src/components/common/Footer.tsx

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0D0B1A] border-t border-white/5 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <Link href="/" className="text-[#D4A84B] font-bold">
              운명사주
            </Link>
            <p className="text-xs text-[#8B85A0] mt-1">
              AI가 명리학으로 풀어내는 당신의 운명
            </p>
          </div>

          <nav className="flex items-center gap-4 text-xs text-[#8B85A0]">
            <Link href="/input" className="hover:text-[#E8E4F0] transition">
              사주 분석
            </Link>
            <Link href="/pricing" className="hover:text-[#E8E4F0] transition">
              가격
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-[#8B85A0]">
            본 서비스의 사주 분석은 명리학에 기반한 참고 정보이며, 의료·법률·투자 조언이 아닙니다.
          </p>
          <p className="text-[10px] text-[#8B85A0] mt-1">
            &copy; {new Date().getFullYear()} FateSaju. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

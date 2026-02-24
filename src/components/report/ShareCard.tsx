"use client";

import { useState, useEffect } from "react";
import type { SajuResult } from "@/lib/saju/types";

interface ShareCardProps {
  sajuResult: SajuResult;
  reportUrl: string;
}

export function ShareCard({ sajuResult, reportUrl }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  const dm = sajuResult.dayMaster;
  const shareText = `운명사주 | ${dm.gan}(${dm.element}) 일간 사주 분석 결과를 확인해보세요!`;

  useEffect(() => {
    // Load Kakao SDK
    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!kakaoAppKey) return;

    if (typeof window !== "undefined" && !document.getElementById("kakao-sdk")) {
      const script = document.createElement("script");
      script.id = "kakao-sdk";
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
      script.onload = () => {
        const Kakao = (window as unknown as Record<string, unknown>).Kakao as {
          init: (key: string) => void;
          isInitialized: () => boolean;
        };
        if (Kakao && !Kakao.isInitialized()) {
          Kakao.init(kakaoAppKey);
        }
        setKakaoReady(true);
      };
      document.head.appendChild(script);
    } else {
      setKakaoReady(true);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleKakaoShare = () => {
    const Kakao = (window as unknown as Record<string, unknown>).Kakao as {
      Share?: {
        sendDefault: (config: Record<string, unknown>) => void;
      };
    };
    if (!Kakao?.Share) return;

    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "운명사주 AI 사주 분석",
        description: shareText,
        imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/og-image.png`,
        link: {
          mobileWebUrl: reportUrl,
          webUrl: reportUrl,
        },
      },
      buttons: [
        {
          title: "내 사주 보기",
          link: {
            mobileWebUrl: reportUrl,
            webUrl: reportUrl,
          },
        },
      ],
    });
  };

  return (
    <div className="bg-bg-elevated rounded-2xl p-4 sm:p-5 border border-border">
      <h3 className="text-sm font-bold text-text-primary mb-3">공유하기</h3>
      <div className="flex gap-2">
        {/* KakaoTalk Share */}
        <button
          onClick={handleKakaoShare}
          disabled={!kakaoReady}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#FEE500] text-[#191919] text-sm font-medium hover:bg-[#FDD835] transition disabled:opacity-40"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.463 2 10.692c0 2.737 1.832 5.133 4.584 6.456-.16.578-.583 2.093-.669 2.416-.107.4.147.395.31.287.127-.085 2.02-1.375 2.84-1.935.615.09 1.245.137 1.888.137h.047c5.523 0 10-3.463 10-7.361C21 6.463 17.523 3 12 3z" />
          </svg>
          카카오톡
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-muted text-brand-light text-sm font-medium hover:bg-brand/20 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "복사됨!" : "링크 복사"}
        </button>
      </div>
      {!process.env.NEXT_PUBLIC_KAKAO_JS_KEY && (
        <p className="text-[10px] text-text-secondary mt-2 text-center">
          NEXT_PUBLIC_KAKAO_JS_KEY 설정 시 카카오톡 공유가 활성화됩니다
        </p>
      )}
    </div>
  );
}

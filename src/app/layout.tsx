import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/lib/i18n/context";
import { GoogleAnalytics } from "@/components/common/GoogleAnalytics";
import type { Locale } from "@/lib/i18n/dictionary";
import "./globals.css";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "운명사주 | AI 사주팔자 무료 분석 — 명리학 기반 정밀 리포트",
  description:
    "생년월일시만 입력하면 AI가 명리학으로 성격, 직업, 연애, 재물운을 분석합니다. 무료 사주 보기.",
  keywords: [
    "무료 사주",
    "사주 보기",
    "사주팔자 풀이",
    "무료 궁합",
    "AI 사주",
    "명리학",
    "운명사주",
  ],
  openGraph: {
    title: "운명사주 | AI가 명리학으로 풀어내는 당신의 운명",
    description:
      "생년월일시만 입력하면 AI가 명리학으로 성격, 직업, 연애, 재물운을 분석합니다.",
    url: "https://fatesaju.com",
    siteName: "운명사주 FateSaju",
    locale: "ko_KR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value;
  const locale: Locale = raw === "en" ? "en" : "ko";

  return (
    <html lang={locale === "ko" ? "ko" : "en"}>
      <body
        className={`${notoSansKR.variable} ${pretendard.variable} ${notoSerifKR.variable} antialiased`}
      >
        <GoogleAnalytics />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}

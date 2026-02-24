import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Skip if locale cookie already set
  const existing = request.cookies.get("locale")?.value;
  if (existing === "ko" || existing === "en") {
    return NextResponse.next();
  }

  let locale: "ko" | "en" = "en"; // default to English

  // 1. Vercel geo header (most reliable on Vercel)
  const country = request.headers.get("x-vercel-ip-country");
  if (country === "KR") {
    locale = "ko";
  } else if (!country) {
    // 2. Fallback to Accept-Language when no geo header (local dev, non-Vercel)
    const acceptLang = request.headers.get("accept-language") || "";
    if (/^ko\b/.test(acceptLang) || acceptLang.includes("ko-KR")) {
      locale = "ko";
    }
  }

  const response = NextResponse.next();
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|og-image).*)",
  ],
};

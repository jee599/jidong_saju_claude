import { NextResponse, type NextRequest } from "next/server";

const OPS_COOKIE = "ops_session";

/**
 * Verify the HMAC-signed ops_session cookie.
 */
async function verifyOpsSession(cookieValue: string): Promise<boolean> {
  try {
    const secret = process.env.OPS_DASH_PASSWORD;
    if (!secret) return false;

    const [payloadB64, signatureHex] = cookieValue.split(".");
    if (!payloadB64 || !signatureHex) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
    const expectedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedHex !== signatureHex) return false;

    const payload = JSON.parse(atob(payloadB64));
    const age = Date.now() - (payload.ts as number);
    return age < 24 * 60 * 60 * 1000; // 24h
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Ops dashboard auth gate ---

  // /log (login page): redirect to dashboard if already authenticated
  if (pathname === "/log") {
    const cookie = request.cookies.get(OPS_COOKIE)?.value;
    if (cookie && (await verifyOpsSession(cookie))) {
      return NextResponse.redirect(new URL("/log/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // /log/dashboard/* : require auth
  if (pathname.startsWith("/log/dashboard")) {
    const cookie = request.cookies.get(OPS_COOKIE)?.value;
    if (!cookie || !(await verifyOpsSession(cookie))) {
      return NextResponse.redirect(new URL("/log", request.url));
    }
    return NextResponse.next();
  }

  // /api/ops/events, /api/ops/stats: require auth
  if (pathname === "/api/ops/events" || pathname === "/api/ops/stats") {
    const cookie = request.cookies.get(OPS_COOKIE)?.value;
    if (!cookie || !(await verifyOpsSession(cookie))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // --- Locale detection (existing logic) ---

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
    "/((?!_next/static|_next/image|favicon.ico|fonts|og-image).*)",
  ],
};

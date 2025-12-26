import { NextRequest, NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // 도메인을 포함한 full url
    const fullUrl = request.nextUrl.origin + request.nextUrl.pathname;
    console.log("fullUrl::::", fullUrl);

    const response = NextResponse.next();

    const shouldSkipLocaleMiddeware = [
        "/load/ping",
        "/api/fordev/sitemap",
    ].some((path) => pathname.startsWith(path));

    if (!shouldSkipLocaleMiddeware) {
        // createMiddleWare는 NextResponse 객체를 반환
    }

    return response;
}

export const config = {
    // 특정 경로에서만 미들웨어를 실행하도록 필터링
    // matcher: "/groupRide/:path*",
    // matcher: ["/((?!api|api/auth|_next/static|_next/image|favicon.ico).*)"],
    // /api/fordev/* 경로는 명시적으로 포함
    matcher: [
        "/((?!monitoring|api|api/auth|_next/static|_next/image|favicon.ico|dist|manifest.json|swe-worker-development.js|sw.js|fallback-development.js|workbox-.*\\.js).*)",
        "/api/fordev/sitemap",
    ],
};

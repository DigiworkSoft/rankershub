import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin API routes (except login)
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;
    const authHeader = request.headers.get("authorization");

    if (!token && !authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};

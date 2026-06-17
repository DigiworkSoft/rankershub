import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function isValidToken(token: string): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin API routes (except login and logout)
  if (
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/login") &&
    !pathname.startsWith("/api/admin/logout")
  ) {
    const token =
      request.cookies.get("admin_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token || !(await isValidToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};

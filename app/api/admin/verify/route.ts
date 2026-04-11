import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  let token: string | null = null;

  if (cookieHeader) {
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

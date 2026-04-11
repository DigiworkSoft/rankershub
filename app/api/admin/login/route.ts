import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`login:${ip}`, { limit: 5, windowMs: 300_000 });
  if (!success) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // Query local database for admin
    const result = await query(
      "SELECT id, username, password_hash FROM admins WHERE username = $1",
      [username]
    );

    const admin = result.rows[0];

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign and issue JWT
    const token = signToken({ id: admin.id, username: admin.username });

    const response = NextResponse.json({
      success: true,
      user: { username: admin.username }
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60, // 12 hours
      path: "/",
    });

    return response;

  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { success } = rateLimit(`enquiry:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { full_name, phone_number, batch, message } = await request.json();

    if (!full_name || !phone_number || !batch) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into local PostgreSQL
    await query(
      "INSERT INTO enquiries (full_name, phone_number, batch, message) VALUES ($1, $2, $3, $4)",
      [full_name, phone_number, batch, message || null]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Enquiry error:", err);
    return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
  }
}

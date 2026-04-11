import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { success } = rateLimit(`admission:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { student_name, phone_number, email, course, school_name, message } = await request.json();

    if (!student_name || !phone_number || !course) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into local PostgreSQL
    await query(
      "INSERT INTO admission_enquiries (student_name, phone_number, email, course, school_name, message) VALUES ($1, $2, $3, $4, $5, $6)",
      [student_name, phone_number, email, course, school_name, message]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Admission error:", err);
    return NextResponse.json({ error: "Failed to save admission enquiry" }, { status: 500 });
  }
}

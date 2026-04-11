import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
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

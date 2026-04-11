import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM faqs ORDER BY created_at ASC");
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("FAQs fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDefaultBatches } from "@/lib/batch-seed";

export async function GET() {
  try {
    await ensureDefaultBatches(query);
    const result = await query("SELECT * FROM courses ORDER BY created_at DESC");
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("Courses fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

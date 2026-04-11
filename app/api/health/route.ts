import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Check local database connection
    const result = await query("SELECT NOW()");
    return NextResponse.json({
      status: "ok",
      db: "local_postgres_connected",
      timestamp: result.rows[0].now
    });
  } catch (err: any) {
    console.error("Health check error:", err);
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");

    let sql = "SELECT * FROM banners WHERE is_active = TRUE";
    const params: any[] = [];

    if (page) {
      sql += " AND page = $1";
      params.push(page);
    }

    sql += " ORDER BY ranking ASC, created_at DESC";

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch banners", details: err?.message },
      { status: 500 }
    );
  }
}

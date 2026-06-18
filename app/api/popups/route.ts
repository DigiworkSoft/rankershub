import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get("location");

    if (!location) {
      return NextResponse.json({ error: "Location parameter is required" }, { status: 400 });
    }

    // Query popups where the location is inside the locations array, ordered by ranking ASC, then created_at DESC
    const result = await query(
      "SELECT * FROM popups WHERE $1 = ANY(locations) ORDER BY ranking ASC, created_at DESC",
      [location]
    );

    return NextResponse.json(result.rows);
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch popups" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(request: Request) {
  const token = getTokenFromHeader(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query("SELECT * FROM admission_enquiries ORDER BY created_at DESC");
    return NextResponse.json(result.rows || []);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch admissions" }, { status: 500 });
  }
}

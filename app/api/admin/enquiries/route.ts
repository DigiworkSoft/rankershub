import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query("SELECT * FROM enquiries ORDER BY created_at DESC");
    return NextResponse.json(result.rows || []);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing enquiry id" }, { status: 400 });

  try {
    await query("DELETE FROM enquiries WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}

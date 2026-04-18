import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, youtube_url } = await request.json();
    if (!title || !youtube_url) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await query("INSERT INTO youtube_videos (title, youtube_url) VALUES ($1, $2)", [title, youtube_url]);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await query("DELETE FROM youtube_videos WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}

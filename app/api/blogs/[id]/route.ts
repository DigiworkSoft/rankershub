import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const result = await query("SELECT * FROM blogs WHERE id = $1 AND published_at <= NOW()", [Number(id)]);
    const post = result.rows[0];

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

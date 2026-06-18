import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { question, answer, category } = await request.json();

    if (!question || !answer || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO faqs (question, answer, category) VALUES ($1, $2, $3) RETURNING id",
      [question, answer, category]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing faq id" }, { status: 400 });

  try {
    await query("DELETE FROM faqs WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing faq id" }, { status: 400 });

  try {
    const { question, answer, category } = await request.json();

    if (!question || !answer || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      "UPDATE faqs SET question = $1, answer = $2, category = $3 WHERE id = $4 RETURNING *",
      [question, answer, category, Number(id)]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, faq: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const { question, answer, category, meta_title, meta_description, geo_region, geo_placename, geo_position, icbm } = item;
        if (!question || !answer || !category) {
          continue;
        }
        const res = await query(
          `INSERT INTO faqs (question, answer, category, meta_title, meta_description, geo_region, geo_placename, geo_position, icbm) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [
            question,
            answer,
            category,
            meta_title || null,
            meta_description || null,
            geo_region || null,
            geo_placename || null,
            geo_position || null,
            icbm || null
          ]
        );
        results.push(res.rows[0].id);
      }
      return NextResponse.json({ success: true, ids: results }, { status: 201 });
    } else {
      const { question, answer, category, meta_title, meta_description, geo_region, geo_placename, geo_position, icbm } = body;

      if (!question || !answer || !category) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const result = await query(
        `INSERT INTO faqs (question, answer, category, meta_title, meta_description, geo_region, geo_placename, geo_position, icbm) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          question,
          answer,
          category,
          meta_title || null,
          meta_description || null,
          geo_region || null,
          geo_placename || null,
          geo_position || null,
          icbm || null
        ]
      );

      return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create FAQ", details: err?.message }, { status: 500 });
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
    const { question, answer, category, meta_title, meta_description, geo_region, geo_placename, geo_position, icbm } = await request.json();

    if (!question || !answer || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      `UPDATE faqs 
       SET question = $1, answer = $2, category = $3, meta_title = $4, meta_description = $5, geo_region = $6, geo_placename = $7, geo_position = $8, icbm = $9 
       WHERE id = $10 RETURNING *`,
      [
        question,
        answer,
        category,
        meta_title || null,
        meta_description || null,
        geo_region || null,
        geo_placename || null,
        geo_position || null,
        icbm || null,
        Number(id)
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, faq: result.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update FAQ", details: err?.message }, { status: 500 });
  }
}


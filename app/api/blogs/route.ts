import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function parsePositiveInt(value: string | null, fallback: number, max?: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  const floored = Math.floor(parsed);
  if (typeof max === "number") return Math.min(floored, max);
  return floored;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams;

    const q = String(search.get("q") || "").trim();
    const tag = String(search.get("tag") || "").trim();
    const sort = String(search.get("sort") || "newest").toLowerCase();
    const page = parsePositiveInt(search.get("page"), 1);
    const limit = parsePositiveInt(search.get("limit"), 9, 30);

    const hasAdvancedParams =
      search.has("page") || search.has("limit") || search.has("q") || search.has("tag") || search.has("sort");

    const whereClauses: string[] = [];
    const values: Array<string | number> = [];

    if (q) {
      values.push(`%${q}%`);
      const idx = values.length;
      whereClauses.push(`(title ILIKE $${idx} OR content ILIKE $${idx} OR author ILIKE $${idx})`);
    }

    if (tag) {
      values.push(tag);
      whereClauses.push(`$${values.length} = ANY(tags)`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    let orderSql = "ORDER BY created_at DESC";
    if (sort === "oldest") {
      orderSql = "ORDER BY created_at ASC";
    }

    if (!hasAdvancedParams) {
      const result = await query(`SELECT * FROM blogs ${orderSql}`);
      return NextResponse.json(result.rows);
    }

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM blogs ${whereSql}`, values);
    const totalItems = Number(countResult.rows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    values.push(limit);
    values.push(offset);

    const result = await query(
      `SELECT * FROM blogs ${whereSql} ${orderSql} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return NextResponse.json({
      items: result.rows,
      meta: {
        page: safePage,
        limit,
        totalItems,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    });
  } catch (err: any) {
    console.error("Blogs fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

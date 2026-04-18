import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateUploadedFile, sanitizeFilename } from "@/lib/upload";
import { validateOrigin } from "@/lib/csrf";
import { uploadFile } from "@/lib/storage";

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const rawTag of tags) {
    const clean = String(rawTag ?? "").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(clean);
  }

  return normalized;
}

function getTextContent(input: string): string {
  return String(input || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePositiveInt(value: string | null, fallback: number, max?: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  const floored = Math.floor(parsed);
  if (typeof max === "number") return Math.min(floored, max);
  return floored;
}

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const search = url.searchParams;

    const q = String(search.get("q") || "").trim();
    const tag = String(search.get("tag") || "").trim();
    const author = String(search.get("author") || "").trim();
    const from = String(search.get("from") || "").trim();
    const to = String(search.get("to") || "").trim();
    const page = parsePositiveInt(search.get("page"), 1);
    const limit = parsePositiveInt(search.get("limit"), 10, 50);

    const whereClauses: string[] = [];
    const values: Array<string | number> = [];

    if (q) {
      values.push(`%${q}%`);
      const idx = values.length;
      whereClauses.push(`(title ILIKE $${idx} OR content ILIKE $${idx})`);
    }

    if (tag) {
      values.push(tag);
      whereClauses.push(`$${values.length} = ANY(tags)`);
    }

    if (author) {
      values.push(`%${author}%`);
      whereClauses.push(`author ILIKE $${values.length}`);
    }

    if (from) {
      values.push(from);
      whereClauses.push(`created_at >= $${values.length}::timestamptz`);
    }

    if (to) {
      values.push(to);
      whereClauses.push(`created_at <= $${values.length}::timestamptz`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM blogs ${whereSql}`, values);
    const totalItems = Number(countResult.rows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const rowsValues = [...values, limit, offset];

    const rowsResult = await query(
      `SELECT * FROM blogs ${whereSql} ORDER BY created_at DESC LIMIT $${rowsValues.length - 1} OFFSET $${rowsValues.length}`,
      rowsValues
    );

    return NextResponse.json({
      items: rowsResult.rows,
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
    console.error("Admin blogs fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "");
    const author = String(formData.get("author") ?? "Admin").trim() || "Admin";
    const tagsRaw = formData.get("tags");

    let tags: string[] = [];
    if (tagsRaw) {
      try {
        tags = normalizeTags(JSON.parse(String(tagsRaw)));
      } catch {
        return NextResponse.json({ error: "Invalid tags format" }, { status: 400 });
      }
    }

    const file = formData.get("image") as File | null;

    if (!title || !getTextContent(content)) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    if (!tags.length) {
      return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
    }

    let image_url: string | null = null;

    if (file && file.size > 0) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const filename = sanitizeFilename("blog", file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      image_url = await uploadFile(filename, buffer, file.type);
    }

    // Insert into PostgreSQL
    const result = await query(
      "INSERT INTO blogs (title, content, author, image_url, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, content, author, image_url, tags]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    console.error("Blog create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing blog id" }, { status: 400 });

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "");
    const author = String(formData.get("author") ?? "Admin").trim() || "Admin";
    const tagsRaw = formData.get("tags");

    let tags: string[] = [];
    if (tagsRaw) {
      try {
        tags = normalizeTags(JSON.parse(String(tagsRaw)));
      } catch {
        return NextResponse.json({ error: "Invalid tags format" }, { status: 400 });
      }
    }

    const file = formData.get("image") as File | null;

    if (!title || !getTextContent(content)) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    if (!tags.length) {
      return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
    }

    const existingBlogResult = await query("SELECT image_url FROM blogs WHERE id = $1", [Number(id)]);
    if (existingBlogResult.rows.length === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    let image_url: string | null = existingBlogResult.rows[0].image_url;

    if (file && file.size > 0) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const filename = sanitizeFilename("blog", file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      image_url = await uploadFile(filename, buffer, file.type);
    }

    const result = await query(
      "UPDATE blogs SET title = $1, content = $2, author = $3, image_url = $4, tags = $5 WHERE id = $6 RETURNING *",
      [title, content, author, image_url, tags, Number(id)]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("Blog update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing blog id" }, { status: 400 });

  try {
    const result = await query("DELETE FROM blogs WHERE id = $1", [Number(id)]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}

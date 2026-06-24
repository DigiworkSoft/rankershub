import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateOrigin } from "@/lib/csrf";

export const dynamic = "force-dynamic";

// GET: returns categories and link lists for editing
export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categoriesResult = await query("SELECT * FROM resource_categories ORDER BY ranking ASC, name ASC");
    const linksResult = await query("SELECT * FROM resource_links ORDER BY category_id ASC, ranking ASC, title ASC");

    return NextResponse.json({
      categories: categoriesResult.rows,
      links: linksResult.rows
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch resources", details: err?.message }, { status: 500 });
  }
}

// POST: Add category or link
export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // "category" | "link"

    const body = await request.json();

    if (type === "category") {
      const { name, ranking } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }
      const rank = parseInt(ranking ?? "0", 10) || 0;

      const result = await query(
        "INSERT INTO resource_categories (name, ranking) VALUES ($1, $2) RETURNING *",
        [name.trim(), rank]
      );
      return NextResponse.json(result.rows[0], { status: 201 });
    } else if (type === "link") {
      const { category_id, title, url: linkUrl, group_name, ranking, content, meta_title, meta_description, meta_keywords, geo_region, geo_placename, geo_position, icbm, bypass_layout } = body;
      if (!category_id || !title || !linkUrl) {
        return NextResponse.json({ error: "Category, title, and URL are required" }, { status: 400 });
      }
      const rank = parseInt(ranking ?? "0", 10) || 0;

      const result = await query(
        "INSERT INTO resource_links (category_id, title, url, group_name, ranking, content, meta_title, meta_description, meta_keywords, geo_region, geo_placename, geo_position, icbm, bypass_layout) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
        [Number(category_id), title.trim(), linkUrl.trim(), group_name ? group_name.trim() : null, rank, content ? content.trim() : null, meta_title ? meta_title.trim() : null, meta_description ? meta_description.trim() : null, meta_keywords ? meta_keywords.trim() : null, geo_region ? geo_region.trim() : null, geo_placename ? geo_placename.trim() : null, geo_position ? geo_position.trim() : null, icbm ? icbm.trim() : null, !!bypass_layout]
      );
      const insertedLink = result.rows[0];
      if (content && content.trim()) {
        const updatedResult = await query(
          "UPDATE resource_links SET url = $1 WHERE id = $2 RETURNING *",
          [`/resources/${insertedLink.id}`, insertedLink.id]
        );
        return NextResponse.json(updatedResult.rows[0], { status: 201 });
      }
      return NextResponse.json(insertedLink, { status: 201 });
    } else {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create resource item", details: err?.message }, { status: 500 });
  }
}

// PUT: Update category or link
export async function PUT(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // "category" | "link"
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const body = await request.json();

    if (type === "category") {
      const { name, ranking } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }
      const rank = parseInt(ranking ?? "0", 10) || 0;

      const result = await query(
        "UPDATE resource_categories SET name = $1, ranking = $2 WHERE id = $3 RETURNING *",
        [name.trim(), rank, Number(id)]
      );
      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    } else if (type === "link") {
      const { category_id, title, url: linkUrl, group_name, ranking, content, meta_title, meta_description, meta_keywords, geo_region, geo_placename, geo_position, icbm, bypass_layout } = body;
      if (!category_id || !title || !linkUrl) {
        return NextResponse.json({ error: "Category, title, and URL are required" }, { status: 400 });
      }
      const rank = parseInt(ranking ?? "0", 10) || 0;

      let finalUrl = linkUrl.trim();
      if (content && content.trim()) {
        finalUrl = `/resources/${id}`;
      }

      const result = await query(
        "UPDATE resource_links SET category_id = $1, title = $2, url = $3, group_name = $4, ranking = $5, content = $6, meta_title = $7, meta_description = $8, meta_keywords = $9, geo_region = $10, geo_placename = $11, geo_position = $12, icbm = $13, bypass_layout = $14 WHERE id = $15 RETURNING *",
        [Number(category_id), title.trim(), finalUrl, group_name ? group_name.trim() : null, rank, content ? content.trim() : null, meta_title ? meta_title.trim() : null, meta_description ? meta_description.trim() : null, meta_keywords ? meta_keywords.trim() : null, geo_region ? geo_region.trim() : null, geo_placename ? geo_placename.trim() : null, geo_position ? geo_position.trim() : null, icbm ? icbm.trim() : null, !!bypass_layout, Number(id)]
      );
      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    } else {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update resource item", details: err?.message }, { status: 500 });
  }
}

// DELETE: Remove category or link
export async function DELETE(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // "category" | "link"
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    if (type === "category") {
      const result = await query("DELETE FROM resource_categories WHERE id = $1", [Number(id)]);
      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } else if (type === "link") {
      const result = await query("DELETE FROM resource_links WHERE id = $1", [Number(id)]);
      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete resource item", details: err?.message }, { status: 500 });
  }
}

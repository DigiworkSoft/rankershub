import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateUploadedFile, sanitizeFilename } from "@/lib/upload";
import { uploadFile } from "@/lib/storage";

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query("SELECT * FROM popups ORDER BY ranking ASC, created_at DESC");
    return NextResponse.json(result.rows);
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch popups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const rankingRaw = String(formData.get("ranking") ?? "1");
    const durationRaw = String(formData.get("duration") ?? "5");
    const locationsRaw = String(formData.get("locations") ?? "[]");
    const file = formData.get("image") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const ranking = Number(rankingRaw);
    if (!Number.isInteger(ranking)) {
      return NextResponse.json({ error: "Ranking must be an integer" }, { status: 400 });
    }

    const duration = Number(durationRaw);
    if (!Number.isInteger(duration) || duration < 3 || duration > 60) {
      return NextResponse.json({ error: "Duration must be between 3 and 60 seconds" }, { status: 400 });
    }

    let locations: string[] = [];
    try {
      locations = JSON.parse(locationsRaw);
      if (!Array.isArray(locations) || locations.length === 0) {
        return NextResponse.json({ error: "At least one location is required" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid locations format" }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const filename = sanitizeFilename("popup", file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = await uploadFile(filename, buffer, file.type);
    }

    const result = await query(
      `INSERT INTO popups (title, description, ranking, duration, locations, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || null, ranking, duration, locations, imageUrl]
    );

    return NextResponse.json({ success: true, popup: result.rows[0] }, { status: 201 });
  } catch (_err: any) {
    return NextResponse.json({ error: "Failed to create popup" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing popup id" }, { status: 400 });

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const rankingRaw = String(formData.get("ranking") ?? "1");
    const durationRaw = String(formData.get("duration") ?? "5");
    const locationsRaw = String(formData.get("locations") ?? "[]");
    const file = formData.get("image") as File | null;
    const preserveImage = String(formData.get("preserve_image") ?? "true") === "true";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const ranking = Number(rankingRaw);
    if (!Number.isInteger(ranking)) {
      return NextResponse.json({ error: "Ranking must be an integer" }, { status: 400 });
    }

    const duration = Number(durationRaw);
    if (!Number.isInteger(duration) || duration < 3 || duration > 60) {
      return NextResponse.json({ error: "Duration must be between 3 and 60 seconds" }, { status: 400 });
    }

    let locations: string[] = [];
    try {
      locations = JSON.parse(locationsRaw);
      if (!Array.isArray(locations) || locations.length === 0) {
        return NextResponse.json({ error: "At least one location is required" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid locations format" }, { status: 400 });
    }

    // Fetch existing popup
    const existingResult = await query("SELECT * FROM popups WHERE id = $1", [Number(id)]);
    if (existingResult.rowCount === 0) {
      return NextResponse.json({ error: "Popup not found" }, { status: 404 });
    }
    const existing = existingResult.rows[0];

    let imageUrl = existing.image_url;
    if (file && file.size > 0) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const filename = sanitizeFilename("popup", file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = await uploadFile(filename, buffer, file.type);
    } else if (!preserveImage) {
      imageUrl = null;
    }

    const result = await query(
      `UPDATE popups 
       SET title = $1, description = $2, ranking = $3, duration = $4, locations = $5, image_url = $6
       WHERE id = $7
       RETURNING *`,
      [title, description || null, ranking, duration, locations, imageUrl, Number(id)]
    );

    return NextResponse.json({ success: true, popup: result.rows[0] });
  } catch (_err: any) {
    return NextResponse.json({ error: "Failed to update popup" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing popup id" }, { status: 400 });

  try {
    const result = await query("DELETE FROM popups WHERE id = $1 RETURNING *", [Number(id)]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Popup not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete popup" }, { status: 500 });
  }
}

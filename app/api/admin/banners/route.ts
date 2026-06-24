import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateUploadedFile, sanitizeFilename } from "@/lib/upload";
import { uploadFile, deleteFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query("SELECT * FROM banners ORDER BY page ASC, ranking ASC, created_at DESC");
    return NextResponse.json(result.rows);
  } catch (_err: any) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
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
    const page = String(formData.get("page") ?? "").trim();
    const rankingRaw = String(formData.get("ranking") ?? "0").trim();
    const isActiveRaw = String(formData.get("is_active") ?? "true").trim();

    const desktopFile = formData.get("desktop_image") as File | null;
    const mobileFile = formData.get("mobile_image") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (page !== "index" && page !== "batches") {
      return NextResponse.json({ error: "Page must be 'index' or 'batches'" }, { status: 400 });
    }

    const ranking = parseInt(rankingRaw, 10);
    if (isNaN(ranking)) {
      return NextResponse.json({ error: "Ranking must be an integer" }, { status: 400 });
    }

    const is_active = isActiveRaw === "true";

    if (!desktopFile || desktopFile.size === 0) {
      return NextResponse.json({ error: "Desktop image is required" }, { status: 400 });
    }
    if (!mobileFile || mobileFile.size === 0) {
      return NextResponse.json({ error: "Mobile image is required" }, { status: 400 });
    }

    // Validate images
    const desktopValidation = validateUploadedFile(desktopFile);
    if (!desktopValidation.valid) {
      return NextResponse.json({ error: `Desktop image: ${desktopValidation.error}` }, { status: 400 });
    }

    const mobileValidation = validateUploadedFile(mobileFile);
    if (!mobileValidation.valid) {
      return NextResponse.json({ error: `Mobile image: ${mobileValidation.error}` }, { status: 400 });
    }

    // Upload files
    const desktopFilename = sanitizeFilename("banner-desktop", desktopFile.name);
    const desktopBuffer = Buffer.from(await desktopFile.arrayBuffer());
    const desktop_image_url = await uploadFile(desktopFilename, desktopBuffer, desktopFile.type);

    const mobileFilename = sanitizeFilename("banner-mobile", mobileFile.name);
    const mobileBuffer = Buffer.from(await mobileFile.arrayBuffer());
    const mobile_image_url = await uploadFile(mobileFilename, mobileBuffer, mobileFile.type);

    const result = await query(
      `INSERT INTO banners (title, desktop_image_url, mobile_image_url, page, ranking, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, desktop_image_url, mobile_image_url, page, ranking, is_active]
    );

    return NextResponse.json({ success: true, banner: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create banner", details: err?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing banner id" }, { status: 400 });
  }

  try {
    const existingResult = await query("SELECT * FROM banners WHERE id = $1", [Number(id)]);
    if (existingResult.rowCount === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }
    const existing = existingResult.rows[0];

    const formData = await request.formData();
    const title = String(formData.get("title") ?? existing.title).trim();
    const page = String(formData.get("page") ?? existing.page).trim();
    const rankingRaw = String(formData.get("ranking") ?? existing.ranking).trim();
    const isActiveRaw = String(formData.get("is_active") ?? existing.is_active).trim();

    const desktopFile = formData.get("desktop_image") as File | null;
    const mobileFile = formData.get("mobile_image") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (page !== "index" && page !== "batches") {
      return NextResponse.json({ error: "Page must be 'index' or 'batches'" }, { status: 400 });
    }

    const ranking = parseInt(rankingRaw, 10);
    if (isNaN(ranking)) {
      return NextResponse.json({ error: "Ranking must be an integer" }, { status: 400 });
    }

    const is_active = isActiveRaw === "true";

    let desktop_image_url = existing.desktop_image_url;
    if (desktopFile && desktopFile.size > 0) {
      const desktopValidation = validateUploadedFile(desktopFile);
      if (!desktopValidation.valid) {
        return NextResponse.json({ error: `Desktop image: ${desktopValidation.error}` }, { status: 400 });
      }

      // Delete old desktop image if it is not a default seeded image
      if (existing.desktop_image_url && !existing.desktop_image_url.startsWith("/assets/")) {
        await deleteFile(existing.desktop_image_url);
      }

      const desktopFilename = sanitizeFilename("banner-desktop", desktopFile.name);
      const desktopBuffer = Buffer.from(await desktopFile.arrayBuffer());
      desktop_image_url = await uploadFile(desktopFilename, desktopBuffer, desktopFile.type);
    }

    let mobile_image_url = existing.mobile_image_url;
    if (mobileFile && mobileFile.size > 0) {
      const mobileValidation = validateUploadedFile(mobileFile);
      if (!mobileValidation.valid) {
        return NextResponse.json({ error: `Mobile image: ${mobileValidation.error}` }, { status: 400 });
      }

      // Delete old mobile image if it is not a default seeded image
      if (existing.mobile_image_url && !existing.mobile_image_url.startsWith("/assets/")) {
        await deleteFile(existing.mobile_image_url);
      }

      const mobileFilename = sanitizeFilename("banner-mobile", mobileFile.name);
      const mobileBuffer = Buffer.from(await mobileFile.arrayBuffer());
      mobile_image_url = await uploadFile(mobileFilename, mobileBuffer, mobileFile.type);
    }

    const result = await query(
      `UPDATE banners
       SET title = $1, desktop_image_url = $2, mobile_image_url = $3, page = $4, ranking = $5, is_active = $6
       WHERE id = $7
       RETURNING *`,
      [title, desktop_image_url, mobile_image_url, page, ranking, is_active, Number(id)]
    );

    return NextResponse.json({ success: true, banner: result.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update banner", details: err?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing banner id" }, { status: 400 });
  }

  try {
    const existingResult = await query("SELECT * FROM banners WHERE id = $1", [Number(id)]);
    if (existingResult.rowCount === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }
    const existing = existingResult.rows[0];

    // Delete files if not default seeded images
    if (existing.desktop_image_url && !existing.desktop_image_url.startsWith("/assets/")) {
      await deleteFile(existing.desktop_image_url);
    }
    if (existing.mobile_image_url && !existing.mobile_image_url.startsWith("/assets/")) {
      await deleteFile(existing.mobile_image_url);
    }

    await query("DELETE FROM banners WHERE id = $1", [Number(id)]);

    return NextResponse.json({ success: true, message: "Banner deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete banner", details: err?.message }, { status: 500 });
  }
}

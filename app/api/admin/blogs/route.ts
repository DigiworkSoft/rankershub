import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateUploadedFile, sanitizeFilename } from "@/lib/upload";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    const author = String(formData.get("author") ?? "Admin");
    const tagsRaw = formData.get("tags");

    let tags: string[] = [];
    if (tagsRaw) {
      try {
        tags = JSON.parse(String(tagsRaw));
        if (!Array.isArray(tags)) tags = [];
      } catch {
        return NextResponse.json({ error: "Invalid tags format" }, { status: 400 });
      }
    }

    const file = formData.get("image") as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let image_url: string | null = null;

    if (file && file.size > 0) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const filename = sanitizeFilename("blog", file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);
      image_url = `/uploads/${filename}`;
    }

    // Insert into local PostgreSQL
    const result = await query(
      "INSERT INTO blogs (title, content, author, image_url, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [title, content, author, image_url, tags]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (err: any) {
    console.error("Blog create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing blog id" }, { status: 400 });

  try {
    await query("DELETE FROM blogs WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}

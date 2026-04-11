import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateUploadedFile, sanitizeFilename } from "@/lib/upload";
import fs from "fs";
import path from "path";

// Ensure the directory exists
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
    const description = String(formData.get("description") ?? "");
    const file = formData.get("image") as File | null;

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let image_url: string | null = null;

    if (file && file.size > 0) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const filename = sanitizeFilename("course", file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);
      image_url = `/uploads/${filename}`;
    }

    // Insert into local PostgreSQL
    const result = await query(
      "INSERT INTO courses (title, description, image_url) VALUES ($1, $2, $3) RETURNING id",
      [title, description, image_url]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (err: any) {
    console.error("Course create error:", err);
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
  if (!id) return NextResponse.json({ error: "Missing course id" }, { status: 400 });

  try {
    // Delete from SQL
    await query("DELETE FROM courses WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateUploadedFile, sanitizeFilename } from "@/lib/upload";
import { ensureCourseBatchColumns } from "@/lib/batch-seed";
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
  await ensureCourseBatchColumns(query);

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const duration = String(formData.get("duration") ?? "");
    const timing = String(formData.get("timing") ?? "");
    const benefits = String(formData.get("benefits") ?? "");
    const syllabus = String(formData.get("syllabus") ?? "");
    const syllabusDetails = String(formData.get("syllabus_details") ?? "");
    const nextBatchStarts = String(formData.get("next_batch_starts") ?? "");
    const feesRaw = String(formData.get("fees") ?? "").trim();
    const discountRaw = String(formData.get("discount_percent") ?? "").trim();
    const file = formData.get("image") as File | null;

    const fees = feesRaw ? Number(feesRaw) : null;
    const discountPercent = discountRaw ? Number(discountRaw) : null;

    if (feesRaw && (!Number.isFinite(fees) || fees! < 0)) {
      return NextResponse.json({ error: "Fees must be a valid non-negative number" }, { status: 400 });
    }
    if (discountRaw && (!Number.isFinite(discountPercent) || discountPercent! < 0 || discountPercent! > 100)) {
      return NextResponse.json({ error: "Discount must be between 0 and 100" }, { status: 400 });
    }

    if (!title || !duration || !timing || !benefits || !syllabus || !nextBatchStarts) {
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
      `INSERT INTO courses (title, description, image_url, duration, timing, benefits, syllabus, syllabus_details, next_batch_starts, fees, discount_percent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [title, description, image_url, duration, timing, benefits, syllabus, syllabusDetails, nextBatchStarts, fees, discountPercent]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (err: any) {
    console.error("Course create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing batch id" }, { status: 400 });

  try {
  await ensureCourseBatchColumns(query);

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const duration = String(formData.get("duration") ?? "");
    const timing = String(formData.get("timing") ?? "");
    const benefits = String(formData.get("benefits") ?? "");
    const syllabus = String(formData.get("syllabus") ?? "");
    const syllabusDetails = String(formData.get("syllabus_details") ?? "");
    const nextBatchStarts = String(formData.get("next_batch_starts") ?? "");
    const feesRaw = String(formData.get("fees") ?? "").trim();
    const discountRaw = String(formData.get("discount_percent") ?? "").trim();
    const file = formData.get("image") as File | null;

    const fees = feesRaw ? Number(feesRaw) : null;
    const discountPercent = discountRaw ? Number(discountRaw) : null;

    if (feesRaw && (!Number.isFinite(fees) || fees! < 0)) {
      return NextResponse.json({ error: "Fees must be a valid non-negative number" }, { status: 400 });
    }
    if (discountRaw && (!Number.isFinite(discountPercent) || discountPercent! < 0 || discountPercent! > 100)) {
      return NextResponse.json({ error: "Discount must be between 0 and 100" }, { status: 400 });
    }

    if (!title || !duration || !timing || !benefits || !syllabus || !nextBatchStarts) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await query("SELECT image_url FROM courses WHERE id = $1", [Number(id)]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    let image_url: string | null = existing.rows[0].image_url ?? null;

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

    await query(
      `UPDATE courses
       SET title = $1,
           description = $2,
           image_url = $3,
           duration = $4,
           timing = $5,
           benefits = $6,
           syllabus = $7,
           syllabus_details = $8,
           next_batch_starts = $9,
           fees = $10,
           discount_percent = $11
       WHERE id = $12`,
      [title, description, image_url, duration, timing, benefits, syllabus, syllabusDetails, nextBatchStarts, fees, discountPercent, Number(id)]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Batch update error:", err);
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
  await ensureCourseBatchColumns(query);
    // Delete from SQL
    await query("DELETE FROM courses WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}

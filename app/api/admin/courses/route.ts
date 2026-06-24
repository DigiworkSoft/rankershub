import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { validateUploadedFile, sanitizeFilename, validateUploadedPdf } from "@/lib/upload";
import { uploadFile, deleteFile } from "@/lib/storage";

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let title = "";
    let description = "";
    let duration = "";
    let timing = "";
    let benefits = "";
    let syllabus = "";
    let syllabusDetails = "";
    let nextBatchStarts = "";
    let feesRaw = "";
    let discountRaw = "";
    let feePlansRaw = "[]";
    let rankingRaw = "0";
    let modeOfLearning = "Offline (Hybrid )";
    let file: File | null = null;
    let syllabusFile: File | null = null;
    let jsonSyllabusPdf: string | null = null;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      title = String(body.title ?? body.course_name ?? "");
      description = String(body.description ?? "");
      duration = String(body.duration ?? "");
      timing = String(body.timing ?? "");
      benefits = String(body.benefits ?? "");
      syllabus = String(body.syllabus ?? "");
      syllabusDetails = String(body.syllabus_details ?? "");
      nextBatchStarts = String(body.next_batch_starts ?? "");
      feesRaw = body.fees !== undefined ? String(body.fees) : "";
      discountRaw = body.discount_percent !== undefined ? String(body.discount_percent) : "";
      feePlansRaw = JSON.stringify(body.fee_plans ?? []);
      rankingRaw = body.ranking !== undefined ? String(body.ranking) : "0";
      jsonSyllabusPdf = body.syllabus_pdf !== undefined ? String(body.syllabus_pdf) : null;
      modeOfLearning = String(body.mode_of_learning ?? "Offline (Hybrid )");
    } else {
      const formData = await request.formData();
      title = String(formData.get("title") ?? formData.get("course_name") ?? "");
      description = String(formData.get("description") ?? "");
      duration = String(formData.get("duration") ?? "");
      timing = String(formData.get("timing") ?? "");
      benefits = String(formData.get("benefits") ?? "");
      syllabus = String(formData.get("syllabus") ?? "");
      syllabusDetails = String(formData.get("syllabus_details") ?? "");
      nextBatchStarts = String(formData.get("next_batch_starts") ?? "");
      feesRaw = String(formData.get("fees") ?? "").trim();
      discountRaw = String(formData.get("discount_percent") ?? "").trim();
      feePlansRaw = String(formData.get("fee_plans") ?? "[]");
      rankingRaw = String(formData.get("ranking") ?? "0").trim();
      file = formData.get("image") as File | null;
      syllabusFile = formData.get("syllabus_pdf") as File | null;
      modeOfLearning = String(formData.get("mode_of_learning") ?? "Offline (Hybrid )");
    }

    const fees = feesRaw ? Number(feesRaw) : null;
    const discountPercent = discountRaw ? Number(discountRaw) : null;
    const ranking = rankingRaw ? Number(rankingRaw) : 0;

    if (feesRaw && (!Number.isFinite(fees) || fees! < 0)) {
      return NextResponse.json({ error: "Fees must be a valid non-negative number" }, { status: 400 });
    }
    if (discountRaw && (!Number.isFinite(discountPercent) || discountPercent! < 0 || discountPercent! > 100)) {
      return NextResponse.json({ error: "Discount must be between 0 and 100" }, { status: 400 });
    }
    if (!Number.isInteger(ranking) || ranking < 0) {
      return NextResponse.json({ error: "Ranking must be a non-negative integer" }, { status: 400 });
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
      image_url = await uploadFile(filename, buffer, file.type);
    }

    // Validate PDF if present
    if (syllabusFile && syllabusFile.size > 0) {
      const validation = validateUploadedPdf(syllabusFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const syllabus_pdf: string | null = jsonSyllabusPdf;

    // Insert into PostgreSQL
    const result = await query(
      `INSERT INTO courses (title, description, image_url, duration, timing, benefits, syllabus, syllabus_details, next_batch_starts, fees, discount_percent, ranking, syllabus_pdf, mode_of_learning)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [title, description, image_url, duration, timing, benefits, syllabus, syllabusDetails, nextBatchStarts, fees, discountPercent, ranking, syllabus_pdf, modeOfLearning]
    );

    const courseId = result.rows[0].id;

    // Handle syllabus PDF upload
    if (syllabusFile && syllabusFile.size > 0) {
      const timestamp = Math.floor(Date.now() / 1000);
      const filename = `course_${courseId}_${timestamp}.pdf`;
      const buffer = Buffer.from(await syllabusFile.arrayBuffer());
      const uploadedPath = await uploadFile(filename, buffer, "application/pdf");
      
      await query("UPDATE courses SET syllabus_pdf = $1 WHERE id = $2", [uploadedPath, courseId]);
    }

    try {
      const feePlans = JSON.parse(feePlansRaw);
      if (Array.isArray(feePlans)) {
        for (const plan of feePlans) {
          const planFees = Number(plan.fees || 0);
          const planDiscount = Number(plan.discount_percent || 0);
          await query(
            `INSERT INTO fee_plans (course_id, duration, fees, discount_percent, mode_of_learning)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (course_id, duration, mode_of_learning) DO UPDATE
             SET fees = EXCLUDED.fees, discount_percent = EXCLUDED.discount_percent`,
            [courseId, String(plan.duration), planFees, planDiscount, plan.mode_of_learning || 'Offline (Hybrid )']
          );
        }
      }
    } catch (_parseError) {
    }

    return NextResponse.json({ success: true, id: courseId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
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
    let title = "";
    let description = "";
    let duration = "";
    let timing = "";
    let benefits = "";
    let syllabus = "";
    let syllabusDetails = "";
    let nextBatchStarts = "";
    let feesRaw = "";
    let discountRaw = "";
    let feePlansRaw = "[]";
    let rankingRaw = "0";
    let modeOfLearning = "Offline (Hybrid )";
    let file: File | null = null;
    let syllabusFile: File | null = null;
    let jsonSyllabusPdf: string | null = null;
    let removeSyllabusPdf = false;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      title = String(body.title ?? body.course_name ?? "");
      description = String(body.description ?? "");
      duration = String(body.duration ?? "");
      timing = String(body.timing ?? "");
      benefits = String(body.benefits ?? "");
      syllabus = String(body.syllabus ?? "");
      syllabusDetails = String(body.syllabus_details ?? "");
      nextBatchStarts = String(body.next_batch_starts ?? "");
      feesRaw = body.fees !== undefined ? String(body.fees) : "";
      discountRaw = body.discount_percent !== undefined ? String(body.discount_percent) : "";
      feePlansRaw = JSON.stringify(body.fee_plans ?? []);
      rankingRaw = body.ranking !== undefined ? String(body.ranking) : "0";
      jsonSyllabusPdf = body.syllabus_pdf !== undefined ? String(body.syllabus_pdf) : null;
      removeSyllabusPdf = body.remove_syllabus_pdf === true;
      modeOfLearning = String(body.mode_of_learning ?? "Offline (Hybrid )");
    } else {
      const formData = await request.formData();
      title = String(formData.get("title") ?? formData.get("course_name") ?? "");
      description = String(formData.get("description") ?? "");
      duration = String(formData.get("duration") ?? "");
      timing = String(formData.get("timing") ?? "");
      benefits = String(formData.get("benefits") ?? "");
      syllabus = String(formData.get("syllabus") ?? "");
      syllabusDetails = String(formData.get("syllabus_details") ?? "");
      nextBatchStarts = String(formData.get("next_batch_starts") ?? "");
      feesRaw = String(formData.get("fees") ?? "").trim();
      discountRaw = String(formData.get("discount_percent") ?? "").trim();
      feePlansRaw = String(formData.get("fee_plans") ?? "[]");
      rankingRaw = String(formData.get("ranking") ?? "0").trim();
      file = formData.get("image") as File | null;
      syllabusFile = formData.get("syllabus_pdf") as File | null;
      removeSyllabusPdf = formData.get("remove_syllabus_pdf") === "true";
      modeOfLearning = String(formData.get("mode_of_learning") ?? "Offline (Hybrid )");
    }

    const fees = feesRaw ? Number(feesRaw) : null;
    const discountPercent = discountRaw ? Number(discountRaw) : null;
    const ranking = rankingRaw ? Number(rankingRaw) : 0;

    if (feesRaw && (!Number.isFinite(fees) || fees! < 0)) {
      return NextResponse.json({ error: "Fees must be a valid non-negative number" }, { status: 400 });
    }
    if (discountRaw && (!Number.isFinite(discountPercent) || discountPercent! < 0 || discountPercent! > 100)) {
      return NextResponse.json({ error: "Discount must be between 0 and 100" }, { status: 400 });
    }
    if (!Number.isInteger(ranking) || ranking < 0) {
      return NextResponse.json({ error: "Ranking must be a non-negative integer" }, { status: 400 });
    }

    if (!title || !duration || !timing || !benefits || !syllabus || !nextBatchStarts) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await query("SELECT image_url, syllabus_pdf FROM courses WHERE id = $1", [Number(id)]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    let image_url: string | null = existing.rows[0].image_url ?? null;
    let syllabus_pdf: string | null = existing.rows[0].syllabus_pdf ?? null;

    if (file && file.size > 0) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const filename = sanitizeFilename("course", file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      image_url = await uploadFile(filename, buffer, file.type);
    }

    if (removeSyllabusPdf) {
      if (syllabus_pdf) {
        await deleteFile(syllabus_pdf);
      }
      syllabus_pdf = null;
    } else if (syllabusFile && syllabusFile.size > 0) {
      const validation = validateUploadedPdf(syllabusFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      if (syllabus_pdf) {
        await deleteFile(syllabus_pdf);
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const filename = `course_${id}_${timestamp}.pdf`;
      const buffer = Buffer.from(await syllabusFile.arrayBuffer());
      syllabus_pdf = await uploadFile(filename, buffer, "application/pdf");
    } else if (jsonSyllabusPdf !== null) {
      syllabus_pdf = jsonSyllabusPdf;
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
           discount_percent = $11,
           ranking = $12,
           syllabus_pdf = $13,
           mode_of_learning = $14
       WHERE id = $15`,
      [title, description, image_url, duration, timing, benefits, syllabus, syllabusDetails, nextBatchStarts, fees, discountPercent, ranking, syllabus_pdf, modeOfLearning, Number(id)]
    );

    // Delete old fee plans and insert the updated list
    try {
      await query("DELETE FROM fee_plans WHERE course_id = $1", [Number(id)]);
      const feePlans = JSON.parse(feePlansRaw);
      if (Array.isArray(feePlans)) {
        for (const plan of feePlans) {
          const planFees = Number(plan.fees || 0);
          const planDiscount = Number(plan.discount_percent || 0);
          await query(
            `INSERT INTO fee_plans (course_id, duration, fees, discount_percent, mode_of_learning)
             VALUES ($1, $2, $3, $4, $5)`,
            [Number(id), String(plan.duration), planFees, planDiscount, plan.mode_of_learning || 'Offline (Hybrid )']
          );
        }
      }
    } catch (_parseError) {
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
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
    // Delete files from storage to prevent orphans
    const existing = await query("SELECT image_url, syllabus_pdf FROM courses WHERE id = $1", [Number(id)]);
    if (existing.rows.length > 0) {
      const imageUrl = existing.rows[0].image_url;
      const syllabusPdf = existing.rows[0].syllabus_pdf;
      if (imageUrl) {
        await deleteFile(imageUrl);
      }
      if (syllabusPdf) {
        await deleteFile(syllabusPdf);
      }
    }

    // Delete from SQL
    await query("DELETE FROM courses WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}

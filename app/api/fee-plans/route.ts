import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    let result;
    if (courseId) {
      result = await query(
        `SELECT f.*, c.title as course_title 
         FROM fee_plans f 
         LEFT JOIN courses c ON f.course_id = c.id 
         WHERE f.course_id = $1 
         ORDER BY f.id ASC`,
        [courseId]
      );
    } else {
      result = await query(
        `SELECT f.*, c.title as course_title 
         FROM fee_plans f 
         LEFT JOIN courses c ON f.course_id = c.id 
         ORDER BY f.course_id ASC, f.id ASC`
      );
    }
    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch fee plans" }, { status: 500 });
  }
}

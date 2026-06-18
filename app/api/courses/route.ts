import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const coursesResult = await query("SELECT * FROM courses ORDER BY created_at DESC");
    const courses = coursesResult.rows;

    const feePlansResult = await query("SELECT * FROM fee_plans ORDER BY id ASC");
    const feePlans = feePlansResult.rows;

    const coursesWithPlans = courses.map((course: any) => ({
      ...course,
      fee_plans: feePlans.filter((plan: any) => plan.course_id === course.id),
    }));

    return NextResponse.json(coursesWithPlans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Total standard enquiries
    const enqCount = await query("SELECT COUNT(*)::int AS count FROM enquiries");
    const totalEnquiries = enqCount.rows[0]?.count || 0;

    // 2. Total admission enquiries
    const admCount = await query("SELECT COUNT(*)::int AS count FROM admission_enquiries");
    const totalAdmissions = admCount.rows[0]?.count || 0;

    // 3. Total courses
    const courseCount = await query("SELECT COUNT(*)::int AS count FROM courses");
    const totalCourses = courseCount.rows[0]?.count || 0;

    // 4. Total blogs
    const blogCount = await query("SELECT COUNT(*)::int AS count FROM blogs");
    const totalBlogs = blogCount.rows[0]?.count || 0;

    // 5. Total FAQs
    const faqCount = await query("SELECT COUNT(*)::int AS count FROM faqs");
    const totalFaqs = faqCount.rows[0]?.count || 0;

    // 6. Total Pop-ups
    const popupCount = await query("SELECT COUNT(*)::int AS count FROM popups");
    const totalPopups = popupCount.rows[0]?.count || 0;

    // 7. Enquiries by Batch/Course
    const batchDistribution = await query(`
      SELECT COALESCE(batch, 'Unspecified') AS label, COUNT(*)::int AS count 
      FROM enquiries 
      GROUP BY batch 
      UNION ALL
      SELECT COALESCE(course, 'Unspecified') AS label, COUNT(*)::int AS count 
      FROM admission_enquiries 
      GROUP BY course
    `);
    
    // Aggregate the distribution to merge duplicates (since "11th Commerce" might be in both standard & admission)
    const distributionMap: Record<string, number> = {};
    batchDistribution.rows.forEach((row: { label: string; count: number }) => {
      const label = String(row.label || "Unspecified").trim();
      distributionMap[label] = (distributionMap[label] || 0) + row.count;
    });
    const formattedDistribution = Object.entries(distributionMap).map(([label, count]) => ({
      label,
      count
    })).sort((a, b) => b.count - a.count);

    // 8. Trend by date (last 14 days)
    // Query standard enquiries grouped by day - group by explicit expression to be compatible with all PG engines
    const standardTrend = await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS trend_date, COUNT(*)::int AS count 
      FROM enquiries 
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
    `);

    // Query admission enquiries grouped by day - group by explicit expression to be compatible with all PG engines
    const admissionTrend = await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS trend_date, COUNT(*)::int AS count 
      FROM admission_enquiries 
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
    `);

    // Combine trends
    const trendMap: Record<string, { date: string; enquiries: number; admissions: number }> = {};
    
    // Fill last 14 days with 0 values to ensure chart is not empty and is continuous
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const labelStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap[dateStr] = { date: labelStr, enquiries: 0, admissions: 0 };
    }

    standardTrend.rows.forEach((row: { trend_date: string; count: number }) => {
      if (trendMap[row.trend_date]) {
        trendMap[row.trend_date].enquiries = row.count;
      }
    });

    admissionTrend.rows.forEach((row: { trend_date: string; count: number }) => {
      if (trendMap[row.trend_date]) {
        trendMap[row.trend_date].admissions = row.count;
      }
    });

    const trendData = Object.values(trendMap);

    return NextResponse.json({
      success: true,
      counts: {
        enquiries: totalEnquiries,
        admissions: totalAdmissions,
        courses: totalCourses,
        blogs: totalBlogs,
        faqs: totalFaqs,
        popups: totalPopups
      },
      distribution: formattedDistribution,
      trend: trendData
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: "Failed to fetch dashboard statistics", details: err?.message }, { status: 500 });
  }
}

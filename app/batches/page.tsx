import { Metadata } from "next";
import { query } from "@/lib/db";
import BatchesClient from "./BatchesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Batches | RankersHub — Commerce Classes Pune",
  description: "Explore our specialized 11th & 12th Commerce and CA Foundation batches in Pune. Enroll now for expert guidance.",
};

// Fetch all data server-side — no client network waterfalls
async function getData() {
  try {
    const [videosResult, faqsResult, coursesResult, feePlansResult] = await Promise.all([
      query("SELECT id, title, youtube_url FROM youtube_videos ORDER BY created_at DESC"),
      query("SELECT id, category, question, answer FROM faqs ORDER BY created_at ASC"),
      query("SELECT id, title, description, duration, timing, benefits, syllabus, syllabus_details, next_batch_starts, fees, discount_percent, image_url, ranking, syllabus_pdf FROM courses ORDER BY ranking ASC, title ASC"),
      query("SELECT * FROM fee_plans ORDER BY id ASC"),
    ]);

    const courses = coursesResult.rows.map((course: any) => ({
      ...course,
      fee_plans: feePlansResult.rows.filter((plan: any) => plan.course_id === course.id),
    }));

    return {
      videos: videosResult.rows,
      faqs: faqsResult.rows,
      courses,
    };
  } catch {
    return { videos: [], faqs: [], courses: [] };
  }
}

export default async function BatchesPage() {
  const { videos, faqs, courses } = await getData();

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      <BatchesClient videos={videos} faqs={faqs} courses={courses} />
    </section>
  );
}

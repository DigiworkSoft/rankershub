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
    const [videosResult, faqsResult, coursesResult] = await Promise.all([
      query("SELECT id, title, youtube_url FROM youtube_videos ORDER BY created_at DESC"),
      query("SELECT id, category, question, answer FROM faqs ORDER BY created_at ASC"),
      query("SELECT id, title, description, duration, timing, benefits, syllabus, syllabus_details, next_batch_starts, fees, discount_percent, image_url FROM courses ORDER BY created_at DESC"),
    ]);

    return {
      videos: videosResult.rows,
      faqs: faqsResult.rows,
      courses: coursesResult.rows,
    };
  } catch (err) {
    console.error("Failed to fetch batches data:", err);
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

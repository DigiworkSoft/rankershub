import { Metadata } from "next";
import { query } from "@/lib/db";
import BatchesClient from "./BatchesClient";

export const metadata: Metadata = {
  title: "Our Batches | RankersHub — Commerce Classes Pune",
  description: "Explore our specialized 11th & 12th Commerce and CA Foundation batches in Pune. Enroll now for expert guidance.",
};

// Fetch all data server-side — no client network waterfalls
async function getData() {
  const [videosResult, faqsResult, coursesResult] = await Promise.all([
    query("SELECT id, title, youtube_url FROM youtube_videos ORDER BY created_at DESC"),
    query("SELECT id, category, question, answer FROM faqs ORDER BY created_at ASC"),
    query("SELECT id, title, description FROM courses ORDER BY created_at DESC"),
  ]);

  return {
    videos: videosResult.rows,
    faqs: faqsResult.rows,
    courses: coursesResult.rows,
  };
}

export default async function BatchesPage() {
  const { videos, faqs, courses } = await getData();

  return (
    <main className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      <BatchesClient videos={videos} faqs={faqs} courses={courses} />
    </main>
  );
}

import { query } from "@/lib/db";
import BatchesClient from "./BatchesClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const otherTags: Record<string, string> = {};
  try {
    const geoResult = await query(
      "SELECT geo_region, geo_placename, geo_position, icbm FROM faqs WHERE geo_region IS NOT NULL AND geo_region <> '' ORDER BY created_at ASC LIMIT 1"
    );
    if (geoResult.rows.length > 0) {
      const geo = geoResult.rows[0];
      if (geo.geo_region) otherTags["geo.region"] = geo.geo_region;
      if (geo.geo_placename) otherTags["geo.placename"] = geo.geo_placename;
      if (geo.geo_position) otherTags["geo.position"] = geo.geo_position;
      if (geo.icbm) otherTags["ICBM"] = geo.icbm;
    }
  } catch {
    // silently ignore
  }

  return {
    title: "Our Batches | RankersHub — Commerce Classes Pune",
    description: "Explore our specialized 11th & 12th Commerce and CA Foundation batches in Pune. Enroll now for expert guidance.",
    other: otherTags,
  };
}

// Fetch all data server-side — no client network waterfalls
async function getData() {
  try {
    const [videosResult, faqsResult, coursesResult, feePlansResult, bannersResult] = await Promise.all([
      query("SELECT id, title, youtube_url FROM youtube_videos ORDER BY created_at DESC"),
      query("SELECT id, category, question, answer, meta_title, meta_description, geo_region, geo_placename, geo_position, icbm FROM faqs ORDER BY created_at ASC"),
      query("SELECT id, title, description, duration, timing, benefits, syllabus, syllabus_details, next_batch_starts, fees, discount_percent, image_url, ranking, syllabus_pdf, mode_of_learning FROM courses ORDER BY ranking ASC, title ASC"),
      query("SELECT * FROM fee_plans ORDER BY id ASC"),
      query("SELECT * FROM banners WHERE page = 'batches' AND is_active = TRUE ORDER BY ranking ASC, created_at DESC"),
    ]);

    const courses = coursesResult.rows.map((course: any) => ({
      ...course,
      fee_plans: feePlansResult.rows.filter((plan: any) => plan.course_id === course.id),
    }));

    return {
      videos: videosResult.rows,
      faqs: faqsResult.rows,
      courses,
      banners: bannersResult.rows,
    };
  } catch {
    return { videos: [], faqs: [], courses: [], banners: [] };
  }
}

export default async function BatchesPage() {
  const { videos, faqs, courses, banners } = await getData();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <BatchesClient videos={videos} faqs={faqs} courses={courses} banners={banners} />
    </section>
  );
}

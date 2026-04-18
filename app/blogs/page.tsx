import { query } from "@/lib/db";
import BlogsClient from "./BlogsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insights & Guides | RankersHub",
  description: "Educational tips, commerce guides, and exam preparation strategies from expert faculty.",
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  let initialPosts = [];
  try {
    const result = await query("SELECT * FROM blogs ORDER BY created_at DESC");
    initialPosts = result.rows;
  } catch (err) {
    console.error("Failed to fetch blogs:", err);
  }
  const initialTag = searchParams?.tag ? decodeURIComponent(searchParams.tag) : null;

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      {/* 
        Note: SiteBackgroundEffects, ScrollToTop, Navbar, and Footer 
        are already provided by RootLayout.
      */}
      <BlogsClient initialPosts={initialPosts} initialTag={initialTag} />
    </section>
  );
}

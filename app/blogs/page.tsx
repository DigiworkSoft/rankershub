import { query } from "@/lib/db";
import BlogsClient from "./BlogsClient";
import PopupDisplay from "@/app/_components/PopupDisplay";

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
    const result = await query("SELECT * FROM blogs WHERE published_at <= NOW() ORDER BY published_at DESC");
    initialPosts = result.rows;
  } catch {}
  const initialTag = searchParams?.tag ? decodeURIComponent(searchParams.tag) : null;

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      {/* 
        Note: SiteBackgroundEffects, ScrollToTop, Navbar, and Footer 
        are already provided by RootLayout.
      */}
      <BlogsClient initialPosts={initialPosts} initialTag={initialTag} />
      <PopupDisplay location="blogs" />
    </section>
  );
}


import { query } from "@/lib/db";
import BlogsClient from "./BlogsClient";

export const metadata = {
  title: "Insights & Guides | RankersHub",
  description: "Educational tips, commerce guides, and exam preparation strategies from expert faculty.",
};

export default async function BlogsPage() {
  const result = await query("SELECT * FROM blogs ORDER BY created_at DESC");
  const initialPosts = result.rows;

  return (
    <main className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      {/* 
        Note: SiteBackgroundEffects, ScrollToTop, Navbar, and Footer 
        are already provided by RootLayout.
      */}
      <BlogsClient initialPosts={initialPosts} />
    </main>
  );
}

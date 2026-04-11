import { query } from "@/lib/db";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

const fallbackPosts = [
  {
    id: 9001,
    title: "11th Commerce Maths: Strong Start Plan for First 60 Days",
    content:
      "If you are in 11th Commerce, your Maths success depends on consistency in the first two months.\n\n1) Study algebra basics and ratio-proportion daily.\n2) Solve 20 questions every day.\n3) Maintain an error notebook.\n4) Revise weak concepts each Sunday.\n\nThis routine builds speed and confidence before board preparation starts.",
    author: "Rankers Hub Faculty",
    image_url: null,
    created_at: "2026-04-01T00:00:00.000Z",
    tags: ["Maths", "Study Plan"]
  },
  {
    id: 9002,
    title: "12th Accounts Board Strategy: How to Score 90+",
    content:
      "Accountancy rewards clarity and presentation.\n\n1) Practice journal, ledger, and final accounts in board format.\n2) Focus on partnership and company account adjustments.\n3) Solve one timed paper every 3 days.\n4) Review common presentation mistakes after each test.\n\nWith regular practice and proper format, scoring 90+ becomes realistic.",
    author: "Accounts Mentor Team",
    image_url: null,
    created_at: "2026-04-03T00:00:00.000Z",
    tags: ["Accounts", "Boards"]
  },
  {
    id: 9003,
    title: "Commerce Boards Revision Timetable for Maths + Accounts",
    content:
      "Use a practical 7-day cycle.\n\n- Day 1-3: Maths concepts + chapter tests\n- Day 4-6: Accounts concepts + full-length questions\n- Day 7: Mixed paper and analysis\n\nLast 30 days: prioritize previous board papers and weak areas. Keep revision short, focused, and repeatable.",
    author: "Board Exam Desk",
    image_url: null,
    created_at: "2026-04-05T00:00:00.000Z",
    tags: ["Revision", "Timetable"]
  }
];

export async function generateMetadata({ params }: Params) {
    const { id } = await params;
    const blogId = Number(id);
    
    let blog;
    const result = await query("SELECT title, content FROM blogs WHERE id = $1", [blogId]);
    blog = result.rows[0];
    
    if (!blog) {
        blog = fallbackPosts.find(p => p.id === blogId);
    }

    if (!blog) return { title: "Article Not Found" };
    return { title: `${blog.title} | RankersHub`, description: blog.content.slice(0, 160) };
}

export default async function BlogArticlePage({ params }: Params) {
  const { id } = await params;
  const blogId = Number(id);

  let blog;
  const result = await query("SELECT * FROM blogs WHERE id = $1", [blogId]);
  blog = result.rows[0];

  if (!blog) {
    blog = fallbackPosts.find(p => p.id === blogId);
  }

  if (!blog) notFound();

  const image = getImageUrl(blog.image_url);

  return (
    <main className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      <article className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 relative max-w-4xl mx-auto">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-primary font-bold mb-8 md:mb-10 hover:gap-4 transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Insights
        </Link>

        {image && (
            <div className="w-full h-[250px] sm:h-[300px] md:h-[450px] mb-8 md:mb-12 rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl relative border-4 md:border-8 border-white">
                <img src={image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
        )}

        <div className="bg-white p-6 sm:p-8 md:p-20 rounded-3xl md:rounded-[3rem] shadow-xl border border-gray-100">
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-8 md:mb-10 text-gray-500 font-semibold border-b border-gray-50 pb-6 md:pb-8">
                <span className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm">
                    <Calendar className="w-4 h-4 text-primary" /> {new Date(blog.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-sm">
                    <User className="w-4 h-4 text-primary" /> {blog.author}
                </span>
                <div className="flex flex-wrap gap-2">
                    {blog.tags && blog.tags.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider truncate">
                            <Tag className="w-3 h-3" /> {tag}
                        </span>
                    ))}
                </div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 md:mb-10 leading-tight tracking-tight">
                {blog.title}
            </h1>

            <div className="prose prose-base md:prose-xl lg:prose-2xl prose-primary max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.content}
            </div>
        </div>
      </article>
    </main>
  );
}

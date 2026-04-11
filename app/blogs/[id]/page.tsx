import { query } from "@/lib/db";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
    const { id } = await params;
    const blogId = Number(id);
    
    const result = await query("SELECT title, content FROM blogs WHERE id = $1", [blogId]);
    const blog = result.rows[0];

    if (!blog) return { title: "Article Not Found" };
    return { title: `${blog.title} | RankersHub`, description: blog.content.slice(0, 160) };
}

export default async function BlogArticlePage({ params }: Params) {
  const { id } = await params;
  const blogId = Number(id);

  const result = await query("SELECT * FROM blogs WHERE id = $1", [blogId]);
  const blog = result.rows[0];

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

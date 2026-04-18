import { query } from "@/lib/db";
import { Calendar, User, Tag, ArrowLeft, Clock3 } from "lucide-react";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImageUrl, formatBlogContentToHtml } from "@/lib/utils";
import RelatedBlogs from "./_components/RelatedBlogs";

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
    const relatedResult = await query(
        "SELECT id, title, image_url, content, created_at FROM blogs WHERE id <> $1 ORDER BY created_at DESC LIMIT 8",
        [blogId]
    );
    const relatedBlogs = relatedResult.rows;
    const formattedContentHtml = formatBlogContentToHtml(blog.content);

    const wordCount = String(blog.content || "").trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
            <article className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 relative max-w-6xl mx-auto">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-primary font-bold mb-8 md:mb-10 hover:gap-4 transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Insights
        </Link>

                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 mb-8 md:mb-12">
                    {image && (
                        <div className="w-full lg:flex-[1.2]">
                            <div className="w-full aspect-square sm:aspect-[4/5] lg:aspect-square max-h-[78vh] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative border-4 md:border-8 border-white bg-gray-100">
                                <img src={image} alt={blog.title} className="w-full h-full object-contain" />
                            </div>
            </div>
                    )}

                    <aside className="w-full lg:flex-1 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 self-start">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-gray-500 font-semibold border-b border-gray-50 pb-5 mb-5 text-xs sm:text-sm">
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                                <Calendar className="w-4 h-4 text-primary" /> {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                                <User className="w-4 h-4 text-primary" /> {blog.author}
                            </span>
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                                <Clock3 className="w-4 h-4 text-primary" /> {readTime} min read
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {blog.tags && blog.tags.map((tag: string) => (
                                <span key={tag} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider truncate">
                                    <Tag className="w-3 h-3" /> {tag}
                                </span>
                            ))}
                        </div>
                    </aside>
                </div>

                <div className="bg-white p-6 sm:p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] shadow-xl border border-gray-100">
                            <div className="prose prose-base md:prose-xl lg:prose-2xl prose-primary max-w-none text-gray-700 leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: formattedContentHtml }} />
                            </div>
        </div>

                <RelatedBlogs posts={relatedBlogs} />
      </article>
    </section>
  );
}

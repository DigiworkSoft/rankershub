import { query } from "@/lib/db";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBlogContentToHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const linkId = Number(id);
  
  const result = await query(
    `SELECT rl.*, rc.name as category_name 
     FROM resource_links rl 
     JOIN resource_categories rc ON rl.category_id = rc.id 
     WHERE rl.id = $1`, 
    [linkId]
  );
  const resource = result.rows[0];

  if (!resource) return { title: "Resource Not Found" };
  
  const title = resource.meta_title || `${resource.title} | ${resource.category_name} | RankersHub`;
  const description = resource.meta_description || (resource.content ? resource.content.replace(/<[^>]*>/g, " ").slice(0, 160) : "");
  const keywords = resource.meta_keywords || "";

  const otherTags: Record<string, string> = {};
  if (resource.geo_region) otherTags["geo.region"] = resource.geo_region;
  if (resource.geo_placename) otherTags["geo.placename"] = resource.geo_placename;
  if (resource.geo_position) otherTags["geo.position"] = resource.geo_position;
  if (resource.icbm) otherTags["ICBM"] = resource.icbm;

  return {
    title,
    description,
    keywords,
    other: otherTags,
  };
}

export default async function ResourcePage({ params }: Params) {
  const { id } = await params;
  const linkId = Number(id);

  const result = await query(
    `SELECT rl.*, rc.name as category_name 
     FROM resource_links rl 
     JOIN resource_categories rc ON rl.category_id = rc.id 
     WHERE rl.id = $1`, 
    [linkId]
  );
  const resource = result.rows[0];

  if (!resource || !resource.content) notFound();

  const formattedContentHtml = formatBlogContentToHtml(resource.content);

  if (resource.bypass_layout) {
    return (
      <section className="min-h-screen bg-white">
        <style dangerouslySetInnerHTML={{ __html: `
          nav, footer, .edu-paper-bg, .edu-notebook-lines, .edu-margin-line, .edu-symbol, .bg-orb {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        ` }} />
        <div dangerouslySetInnerHTML={{ __html: formattedContentHtml }} />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit pt-24 md:pt-32 pb-12 md:pb-20">
      <div className="max-w-4xl mx-auto px-4 relative">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:gap-4 transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Resource Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-3">
            <span className="bg-primary/10 px-3 py-1.5 rounded-full">{resource.category_name}</span>
            {resource.group_name && (
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">{resource.group_name}</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            {resource.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
            <Calendar className="w-4 h-4" /> Updated {new Date(resource.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Resource Body Content */}
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-3xl shadow-xl border border-gray-100">
          <div className="prose prose-base md:prose-lg max-w-none text-gray-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: formattedContentHtml }} />
          </div>
        </div>
      </div>
    </section>
  );
}

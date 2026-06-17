"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Search, Clock3 } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { PRESET_BLOG_TAGS } from "@/lib/blog-tags";

type BlogPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  image_url: string | null;
  tags?: string[];
  created_at: string;
};

export default function BlogsClient({
  initialPosts,
  initialTag,
}: {
  initialPosts: BlogPost[];
  initialTag?: string | null;
}) {
  const [query, setQuery] = useState("");
  const tagsScrollerRef = useRef<HTMLDivElement>(null);

  const posts = initialPosts;

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>(PRESET_BLOG_TAGS);
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) post.tags.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const [activeTag, setActiveTag] = useState<string | null>(() => {
    if (!initialTag) return null;
    return uniqueTags.includes(initialTag) ? initialTag : null;
  });

  useEffect(() => {
    if (initialTag && uniqueTags.includes(initialTag)) {
      setActiveTag(initialTag);
    }
  }, [initialTag, uniqueTags]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTag) result = result.filter((post) => post.tags && post.tags.includes(activeTag));
    const q = query.trim().toLowerCase();
    if (q) result = result.filter((post) => [post.title, post.content, post.author].some((v) => (v || "").toLowerCase().includes(q)));
    return result;
  }, [posts, query, activeTag]);

  const estimateReadTime = (content: string) => {
    const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  useEffect(() => {
    const container = tagsScrollerRef.current;
    if (!container || uniqueTags.length <= 1) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    let interval: NodeJS.Timeout;

    const startAutoScroll = () => {
      interval = setInterval(() => {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft <= 0) return;

        const nextLeft = container.scrollLeft + 120;
        if (nextLeft >= maxScrollLeft) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollTo({ left: nextLeft, behavior: "smooth" });
        }
      }, 1000);
    };

    const stopAutoScroll = () => clearInterval(interval);

    startAutoScroll();
    container.addEventListener("touchstart", stopAutoScroll, { passive: true });
    container.addEventListener("touchend", startAutoScroll, { passive: true });

    return () => {
      stopAutoScroll();
      container.removeEventListener("touchstart", stopAutoScroll);
      container.removeEventListener("touchend", startAutoScroll);
    };
  }, [uniqueTags.length]);

  return (
    <div className="pt-16 md:pt-28 pb-12 md:pb-20 font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-8 mb-8 md:mb-16">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-7xl font-extrabold text-gray-900 mb-4 md:mb-6 tracking-tight"
            >
              Educational <span className="text-primary">Insights</span>
            </motion.h1>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed">
              Stay updated with the latest trends in commerce education, study tips,
              and career guidance from our expert faculty.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {uniqueTags.length > 0 && (
          <div className="mb-8">
            <span className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Filters:</span>
            <div
              ref={tagsScrollerRef}
              className="flex md:flex-wrap gap-2 items-center overflow-x-auto no-scrollbar snap-x snap-mandatory touch-pan-x pb-1"
            >
              <button
                onClick={() => setActiveTag(null)}
                className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeTag === null ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"}`}
              >
                All Blogs
              </button>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeTag === tag ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500 text-lg">No blog articles found matching your criteria.</p>
            </div>
          ) : (
            filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link href={`/blogs/${post.id}`}>
                  <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-5 card-shadow flex items-center justify-center">
                    {post.image_url ? (
                      <img
                        src={getImageUrl(post.image_url)}
                        alt={post.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="px-2">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-medium">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(post.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" /> {estimateReadTime(post.content)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {post.content.replace(/<[^>]*>/g, "").substring(0, 120)}...
                    </p>
                    <div className="flex items-center text-sm font-bold text-primary group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

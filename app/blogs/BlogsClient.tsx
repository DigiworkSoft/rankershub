"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";

type BlogPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  image_url: string | null;
  tags?: string[];
  created_at: string;
};

const fallbackPosts: BlogPost[] = [
  {
    id: 9001,
    title: "11th Commerce Maths: Strong Start Plan for First 60 Days",
    content:
      "If you are in 11th Commerce, your Maths success depends on consistency in the first two months. Focus on basic algebra, ratio-proportion, and daily 45-minute practice. Keep one error notebook and revise mistakes every Sunday.",
    author: "Rankers Hub Faculty",
    image_url: null,
    tags: ["Maths", "Study Plan"],
    created_at: "2026-04-01T00:00:00.000Z"
  },
  {
    id: 9002,
    title: "12th Accounts Board Strategy: How to Score 90+",
    content:
      "In Accountancy, marks come from format accuracy and stepwise working. Practice final accounts, partnership adjustments, and company accounts with timed tests. Use past papers and always show narration where required.",
    author: "Accounts Mentor Team",
    image_url: null,
    tags: ["Accounts", "Boards"],
    created_at: "2026-04-03T00:00:00.000Z"
  },
  {
    id: 9003,
    title: "Commerce Boards Revision Timetable for Maths + Accounts",
    content:
      "Create a 7-day revision cycle: 3 days Maths, 3 days Accounts, 1 day mixed test. Keep two sessions daily: concept revision and question solving. In the last 30 days, prioritize previous board papers and weak chapters.",
    author: "Board Exam Desk",
    image_url: null,
    tags: ["Revision", "Timetable"],
    created_at: "2026-04-05T00:00:00.000Z"
  }
];



export default function BlogsClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const posts = useMemo(() => {
    return [...initialPosts, ...fallbackPosts];
  }, [initialPosts]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) post.tags.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTag) result = result.filter((post) => post.tags && post.tags.includes(activeTag));
    const q = query.trim().toLowerCase();
    if (q) result = result.filter((post) => [post.title, post.content, post.author].some((v) => (v || "").toLowerCase().includes(q)));
    return result;
  }, [posts, query, activeTag]);

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
          <div className="flex flex-wrap gap-2 mb-8 items-center">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mr-2">Filters:</span>
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeTag === null ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"}`}
            >
              All Blogs
            </button>
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeTag === tag ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500 text-lg">No blog articles found matching your criteria.</p>
            </div>
          ) : filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={getImageUrl(post.image_url)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 underline-offset-4"
                  referrerPolicy="no-referrer"
                />
                {post.tags && post.tags.length > 0 && (
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-primary shadow-sm uppercase tracking-wider">
                      {post.tags[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-1">
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 font-semibold">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> {post.author}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-6 md:mb-8 line-clamp-3 text-base md:text-lg leading-relaxed">
                  {post.content}
                </p>
                <div className="mt-auto pt-5 md:pt-6 border-t border-gray-50">
                  <Link href={`/blogs/${post.id}`} className="inline-flex items-center gap-2 text-primary font-bold text-base md:text-lg group-hover:translate-x-2 transition-transform">
                    Read Full Article <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type RelatedBlog = {
  id: number;
  title: string;
  image_url: string | null;
  created_at: string;
};

export default function RelatedBlogsAutoScroll({ posts }: { posts: RelatedBlog[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(false);

  const items = useMemo(() => {
    if (posts.length <= 1) return posts;
    return [...posts, ...posts];
  }, [posts]);

  useEffect(() => {
    const container = scrollerRef.current;
    if (!container || posts.length < 2) return;

    const tick = () => {
      if (isPausedRef.current) return;

      const cardWidth = 304; // includes width + gap
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const next = container.scrollLeft + cardWidth;

      if (next >= maxScrollLeft - cardWidth) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      container.scrollBy({ left: cardWidth, behavior: "smooth" });
    };

    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [posts.length]);

  if (!posts.length) return null;

  return (
    <section className="mt-12 md:mt-16">
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">More Blogs</h2>
        <Link href="/blogs" className="text-primary text-sm md:text-base font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth"
        aria-label="Related blogs auto scrolling strip"
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        onTouchStart={() => {
          isPausedRef.current = true;
        }}
        onTouchEnd={() => {
          isPausedRef.current = false;
        }}
      >
        {items.map((post, index) => (
          <Link
            href={`/blogs/${post.id}`}
            key={`${post.id}-${index}`}
            className="min-w-[260px] sm:min-w-[280px] max-w-[280px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/5] bg-gray-100">
              <img src={getImageUrl(post.image_url)} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">{new Date(post.created_at).toLocaleDateString()}</p>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{post.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

"use client";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface Blog {
  id: number;
  title: string;
  image_url: string;
  content: string;
}

export default function RelatedBlogs({ posts }: { posts: Blog[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const uniqueBlogs = useMemo(
    () => Array.from(new Map(posts.map((post) => [post.id, post])).values()),
    [posts]
  );

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    if (uniqueBlogs.length <= 1) return;

    let scrollInterval: ReturnType<typeof setInterval> | undefined;

    const startScrolling = () => {
      if (scrollInterval) clearInterval(scrollInterval);

      scrollInterval = setInterval(() => {
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        if (maxScrollLeft <= 0) return;

        const firstCard = scrollContainer.querySelector("[data-related-blog-card='true']") as HTMLElement | null;
        if (!firstCard) return;

        const cardWidth = firstCard.getBoundingClientRect().width;
        const styles = window.getComputedStyle(scrollContainer);
        const gap = Number.parseFloat(styles.columnGap || styles.gap || "24") || 24;
        const nextLeft = scrollContainer.scrollLeft + cardWidth + gap;

        if (nextLeft >= maxScrollLeft - 1) {
          scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainer.scrollTo({ left: nextLeft, behavior: "smooth" });
        }
      }, 1000);
    };

    const stopScrolling = () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };

    startScrolling();

    scrollContainer.addEventListener("mouseenter", stopScrolling);
    scrollContainer.addEventListener("mouseleave", startScrolling);
    scrollContainer.addEventListener("touchstart", stopScrolling, { passive: true });
    scrollContainer.addEventListener("touchend", startScrolling, { passive: true });

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
      scrollContainer.removeEventListener("mouseenter", stopScrolling);
      scrollContainer.removeEventListener("mouseleave", startScrolling);
      scrollContainer.removeEventListener("touchstart", stopScrolling);
      scrollContainer.removeEventListener("touchend", startScrolling);
    };
  }, [uniqueBlogs.length]);

  if (uniqueBlogs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          Related Articles
        </h2>
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-6 no-scrollbar"
        >
          {uniqueBlogs.map((blog) => (
            <Link href={`/blogs/${blog.id}`} key={blog.id}>
              <div data-related-blog-card="true" className="group flex-shrink-0 w-80 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer">
                <div className="relative h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <Image
                    src={getImageUrl(blog.image_url)}
                    alt={blog.title}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate group-hover:text-purple-600">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {blog.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

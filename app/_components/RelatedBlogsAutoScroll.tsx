"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface Blog {
  id: number;
  title: string;
  image_url: string;
  content: string;
}

export default function RelatedBlogsAutoScroll() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const uniqueBlogs = useMemo(
    () => Array.from(new Map(blogs.map(item => [item.id, item])).values()),
    [blogs]
  );

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        if (!res.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : data?.items || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) return;

    let scrollInterval: NodeJS.Timeout;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          const scrollAmount = 2;
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollLeft = 0;
          } else {
            scrollContainer.scrollLeft += scrollAmount;
          }
        }
      }, 50);
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval);
    };

    if (uniqueBlogs.length > 3) {
      startScrolling();
    }

    scrollContainer.addEventListener("mouseenter", stopScrolling);
    scrollContainer.addEventListener("mouseleave", startScrolling);

    return () => {
      clearInterval(scrollInterval);
      scrollContainer.removeEventListener("mouseenter", stopScrolling);
      scrollContainer.removeEventListener("mouseleave", startScrolling);
    };
  }, [uniqueBlogs]);

  if (blogs.length === 0) {
    return null;
  }

  const duplicatedBlogs = uniqueBlogs.length > 3 ? [...uniqueBlogs, ...uniqueBlogs] : uniqueBlogs;

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800">
          Our Latest Blog
        </h2>
        <div
          ref={scrollContainerRef}
          className={`flex overflow-x-auto gap-4 md:gap-6 no-scrollbar pb-2 snap-x snap-mandatory touch-pan-x ${uniqueBlogs.length <= 3 ? "md:justify-center" : ""}`}
        >
          {duplicatedBlogs.map((blog, index) => (
            <Link href={`/blogs/${blog.id}`} key={`${blog.id}-${index}`} className="snap-start">
              <div className="group flex-shrink-0 w-[84vw] max-w-[21rem] sm:w-80 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer">
                <div className="relative h-44 sm:h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <Image
                    src={getImageUrl(blog.image_url)}
                    alt={blog.title}
                    fill
                    className="rounded-t-lg object-contain"
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

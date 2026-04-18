"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

type Video = {
  id: number;
  title: string;
  youtube_url: string;
};

function youtubeIdFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    const v = parsed.searchParams.get("v");
    if (v) return v;
    if (parsed.pathname.includes("/shorts/")) return parsed.pathname.split("/shorts/")[1];
    return "";
  } catch {
    return "";
  }
}

export default function DemoLecturesSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const videosStripRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(false);

  const scrollingVideos = useMemo(() => {
    if (videos.length <= 1) return videos;
    return [...videos, ...videos];
  }, [videos]);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(() => setVideos([]));
  }, []);

  useEffect(() => {
    const strip = videosStripRef.current;
    if (!strip || videos.length <= 1) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const getStep = () => {
      const firstCard = strip.firstElementChild as HTMLElement | null;
      if (!firstCard) return 0;

      const styles = window.getComputedStyle(strip);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const pause = () => {
      isPausedRef.current = true;
    };
    const resume = () => {
      isPausedRef.current = false;
    };

    strip.addEventListener("mouseenter", pause);
    strip.addEventListener("mouseleave", resume);
    strip.addEventListener("touchstart", pause, { passive: true });
    strip.addEventListener("touchend", resume);

    const interval = window.setInterval(() => {
      if (isPausedRef.current) return;
      if (strip.scrollWidth <= strip.clientWidth + 1) return;

      const step = getStep();
      if (!step) return;

      const loopWidth = strip.scrollWidth / 2;
      if (strip.scrollLeft >= loopWidth - 2) {
        strip.scrollLeft -= loopWidth;
      }

      strip.scrollTo({
        left: strip.scrollLeft + step,
        behavior: "smooth",
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
      strip.removeEventListener("mouseenter", pause);
      strip.removeEventListener("mouseleave", resume);
      strip.removeEventListener("touchstart", pause);
      strip.removeEventListener("touchend", resume);
    };
  }, [videos.length]);

  return (
    <section id="informative-videos" className="py-12 md:py-20 bg-gray-50 scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-5 md:p-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
            Watch The <span className="text-primary">Informative video</span>
          </h2>

          {videos.length === 0 ? (
            <p className="text-center text-gray-500">No demo videos added yet.</p>
          ) : (
              <div ref={videosStripRef} className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-2 px-2 md:mx-0 md:px-0 scroll-smooth">
                {scrollingVideos.map((video, idx) => {
                const videoId = youtubeIdFromUrl(video.youtube_url);
                const thumb = videoId
                  ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                  : "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000";

                return (
                  <motion.a
                    key={`${video.id}-${idx}`}
                    href={video.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -4 }}
                    className="group block rounded-2xl overflow-hidden border border-gray-200 hover:border-primary/40 transition-all bg-gray-50 min-w-[88%] sm:min-w-[70%] md:min-w-[calc((100%-1.5rem)/2)] lg:min-w-[calc((100%-3rem)/3)] snap-start"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={thumb}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="bg-red-600 text-white rounded-full p-3 group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2">{video.title}</h3>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

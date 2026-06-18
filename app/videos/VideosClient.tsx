"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Calendar, ExternalLink, Play, Eye } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export default function VideosClient() {
  const [data, setData] = useState<{ videos: VideoItem[]; shorts: VideoItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/youtube-feed")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load videos");
        }
        return res.json();
      })
      .then((feed) => {
        setData(feed);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong while fetching videos");
        setLoading(false);
      });
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pt-32 pb-20 font-outfit min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex p-3 bg-red-50 text-red-600 rounded-3xl mb-6 shadow-sm border border-red-100"
          >
            <Youtube className="w-8 h-8 fill-red-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            Latest from <span className="text-primary">YouTube</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tune in to our latest commerce lectures, revision sprints, exam tips, and guides directly from our channel.
          </p>
          <a
            href="https://www.youtube.com/@rankershubpune"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-600/20"
          >
            Subscribe on YouTube <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-16">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                    <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-3xl text-center max-w-2xl mx-auto shadow-sm">
            <p className="text-lg font-bold mb-3">Failed to load content</p>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetch("/api/youtube-feed")
                  .then((res) => res.json())
                  .then((feed) => {
                    setData(feed);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError(err.message || "Failed to reload");
                    setLoading(false);
                  });
              }}
              className="px-6 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && !error && data && (
          <div className="space-y-20">
            
            {/* Standard Videos Section */}
            {data.videos.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 border-l-4 border-primary pl-4">
                  Latest Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {data.videos.map((video, idx) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-primary/20 flex flex-col justify-between"
                    >
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                            <Play className="w-6 h-6 fill-white" />
                          </div>
                        </div>
                      </a>
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            {video.title}
                          </a>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(video.publishedAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Shorts Section */}
            {data.shorts.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 border-l-4 border-red-600 pl-4">
                  Latest Shorts
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                  {data.shorts.map((short, idx) => (
                    <motion.div
                      key={short.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-red-600/20 flex flex-col justify-between"
                    >
                      <a href={short.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-[9/16] bg-gray-100 overflow-hidden">
                        <img
                          src={short.thumbnailUrl}
                          alt={short.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform shadow-md">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                      </a>
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <h3 className="font-bold text-gray-900 text-xs md:text-sm leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                          <a href={short.url} target="_blank" rel="noopener noreferrer">
                            {short.title}
                          </a>
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(short.publishedAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

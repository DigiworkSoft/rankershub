"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  videoSrc: string;
  thumbnailSrc: string;
}

export default function HeroVideoDialog({ videoSrc, thumbnailSrc }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract video ID from youtube URL
  const getEmbedUrl = (url: string) => {
    let videoId = "";
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
        else videoId = urlObj.searchParams.get("v") || "";
    } catch { return ""; }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div className="relative w-full h-full">
      <div 
        className="relative w-full h-full cursor-pointer group overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={thumbnailSrc} 
          alt="Video Thumbnail" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white" />
            </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 md:p-10"
            onClick={() => setIsOpen(false)}
          >
            <button 
                className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-10"
                onClick={() => setIsOpen(false)}
            >
                <X className="w-10 h-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={getEmbedUrl(videoSrc)}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Banner {
  id: number;
  title: string;
  desktop_image_url: string;
  mobile_image_url: string;
  page: string;
  is_active: boolean;
  ranking: number;
}

interface BannerSliderProps {
  banners: Banner[];
  alt?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export default function BannerSlider({ banners, alt = "Banner" }: BannerSliderProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeBanners = banners.filter((b) => b.is_active);

  useEffect(() => {
    setIndex(0);
  }, [banners]);

  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length, isHovered]);

  if (activeBanners.length === 0) {
    return null;
  }

  // If there's only one banner, render it normally to avoid animation overhead
  if (activeBanners.length === 1) {
    const banner = activeBanners[0];
    return (
      <picture className="w-full h-auto block">
        <source media="(max-width: 768px)" srcSet={banner.mobile_image_url} />
        <img
          src={banner.desktop_image_url}
          alt={banner.title || alt}
          className="w-full h-auto object-cover"
        />
      </picture>
    );
  }

  const currentBanner = activeBanners[index];

  const handleNext = () => {
    setDirection(1);
    setIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prevIndex) => (prevIndex - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <div
      className="group relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic container adjusting height based on the first banner image */}
      <div className="relative w-full">
        {/* Ghost image to establish the height dynamically */}
        <picture className="w-full h-auto block opacity-0 pointer-events-none">
          <source media="(max-width: 768px)" srcSet={activeBanners[0].mobile_image_url} />
          <img
            src={activeBanners[0].desktop_image_url}
            alt="spacer"
            className="w-full h-auto object-cover"
          />
        </picture>

        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentBanner.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <picture className="w-full h-full block">
              <source media="(max-width: 768px)" srcSet={currentBanner.mobile_image_url} />
              <img
                src={currentBanner.desktop_image_url}
                alt={currentBanner.title || alt}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </picture>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center z-10 hover:scale-105 active:scale-95"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center z-10 hover:scale-105 active:scale-95"
        aria-label="Next banner"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {activeBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === i ? "bg-white w-4" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

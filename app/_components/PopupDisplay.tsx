"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Popup = {
  id: number;
  title: string;
  description: string | null;
  ranking: number;
  duration: number;
  locations: string[];
  image_url: string | null;
};

type PopupDisplayProps = {
  location: "landing" | "about" | "contact" | "blogs";
};

export default function PopupDisplay({ location }: PopupDisplayProps) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Check if the popup has been closed in this session to prevent annoying users
    const isClosed = sessionStorage.getItem(`popup-closed-${location}`);
    if (isClosed) return;

    fetch(`/api/popups?location=${location}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // The API already returns them sorted by ranking ASC, so first one has highest priority
          const activePopup = data[0];
          setPopup(activePopup);
          setTimeLeft(activePopup.duration);
          // Show the popup after a brief delay (1 second) for better UX
          const delayTimer = setTimeout(() => {
            setIsOpen(true);
          }, 1000);
          return () => clearTimeout(delayTimer);
        }
      })
      .catch(() => {});
  }, [location]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(`popup-closed-${location}`, "true");
  }, [location]);

  // Handle countdown and auto-close
  useEffect(() => {
    if (!isOpen || !popup || timeLeft <= 0) {
      if (isOpen && timeLeft <= 0) {
        handleClose();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, popup, handleClose]);


  if (!popup) return null;

  const progressPercent = popup.duration > 0 ? (timeLeft / popup.duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-700 rounded-full transition-colors z-20"
              aria-label="Close Pop-up"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image (if exists) */}
            {popup.image_url && (
              <div className="relative aspect-video w-full overflow-hidden bg-gray-50 shrink-0">
                <img
                  src={popup.image_url}
                  alt={popup.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{popup.title}</h3>
                {popup.description && (
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-4">
                    {popup.description}
                  </p>
                )}
              </div>

              {/* Progress bar countdown indicator */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400 font-medium">
                  Closing in {timeLeft}s
                </span>
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

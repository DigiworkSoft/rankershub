"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourse?: string;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  defaultCourse = "",
}: EnrollmentModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    message: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset or pre-fill form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        phone: "",
        email: "",
        course: defaultCourse || "",
        message: "",
      });
      setStatus("idle");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, defaultCourse]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: formData.name,
          phone_number: formData.phone,
          email: formData.email || null,
          course: formData.course,
          message: formData.message || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save enquiry in database");

      setStatus("success");

      const whatsappMessage = `*Enrollment Enquiry - RankerHub*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Email:* ${formData.email || "N/A"}%0A*Course:* ${formData.course}%0A*Message:* ${formData.message || "N/A"}`;
      const whatsappUrl = `https://wa.me/919272547817?text=${whatsappMessage}`;

      setTimeout(() => {
        onClose();
        window.open(whatsappUrl, "_blank");
      }, 500);
    } catch {
      setStatus("error");
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Centering container — pointer-events-none so clicks on bg pass through to backdrop */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto"
            >
              {/* Header — fixed, never scrolls */}
              <div className="bg-gradient-to-br from-primary to-indigo-800 p-6 sm:p-8 text-white relative overflow-hidden rounded-t-3xl flex-shrink-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                    Enrollment Enquiry
                  </h3>
                  <p className="text-white/70 text-sm font-medium">
                    Fill in your details and we&apos;ll connect with you on WhatsApp
                  </p>
                </div>
              </div>

              {/* Form — scrolls internally when viewport is short */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
                {status === "error" && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                    An error occurred. Please try again or contact us directly.
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="enroll-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="enroll-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="enroll-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="enroll-phone"
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="enroll-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="enroll-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>

                {/* Course */}
                <div>
                  <label htmlFor="enroll-course" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="enroll-course"
                    name="course"
                    required
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a course</option>
                    <option value="11th Commerce">11th Commerce</option>
                    <option value="12th Commerce">12th Commerce</option>
                    <option value="Weekend Batch">Weekend Batch</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="enroll-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Message (Optional)
                  </label>
                  <textarea
                    id="enroll-message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any questions or additional info..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold tracking-wide py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 cursor-pointer text-sm uppercase disabled:opacity-75"
                >
                  <Send className="h-5 w-5" />
                  {status === "submitting" ? "Submitting..." : "Submit & Connect on WhatsApp"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">
                  You will be redirected to WhatsApp to complete your enquiry
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Send, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function EnquiryForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [batches, setBatches] = useState<string[]>(["11th Commerce", "12th Commerce", "Other"]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    batch: "11th Commerce",
    message: "",
  });

  const [phoneError, setPhoneError] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const fetchCaptcha = async () => {
    try {
      const res = await fetch("/api/captcha");
      if (res.ok) {
        const data = await res.json();
        setCaptchaSvg(data.svg);
        setCaptchaToken(data.token);
        setCaptchaAnswer("");
      }
    } catch {
      // Fail silently
    }
  };

  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const courseTitles = data.map((course: any) => course.title);
            if (!courseTitles.includes("Other")) {
              courseTitles.push("Other");
            }
            setBatches(courseTitles);
            setFormData((prev) => ({ ...prev, batch: courseTitles[0] }));
          }
        }
      } catch {
        // Fail silently
      }
    }
    fetchBatches();
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.phone_number.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          captcha_token: captchaToken,
          captcha_answer: captchaAnswer,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed sending enquiry");
      }
      setStatus("success");
    } catch (err: any) {
      setStatus("idle");
      alert(err.message || "Error sending enquiry. Please try again.");
      fetchCaptcha();
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl border border-secondary/20 text-center space-y-4"
      >
        <div className="w-16 h-16 bg-secondary/20 text-primary rounded-full flex items-center justify-center mx-auto">
          <Send className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Enquiry Sent!</h3>
        <p className="text-gray-600">Our team will contact you within 24 hours.</p>
        <button
          onClick={() => {
            setStatus("idle");
            setFormData({ full_name: "", phone_number: "", batch: "11th Commerce", message: "" });
            setPhoneError("");
          }}
          className="text-primary font-bold hover:underline"
        >
          Send another enquiry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Enquiry</h3>
      <p className="text-gray-500 text-sm mb-6">Have questions? Let us help you choose the right path.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
          <input
            required
            type="text"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
          <input
            required
            type="tel"
            placeholder="10-digit mobile number"
            value={formData.phone_number}
            onChange={(e) => {
              const cleanVal = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData({ ...formData, phone_number: cleanVal });
              if (cleanVal.length > 0 && cleanVal.length < 10) {
                setPhoneError("Phone number must be exactly 10 digits");
              } else {
                setPhoneError("");
              }
            }}
            className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 ${
              phoneError 
                ? "border-red-500 focus:ring-red-200 focus:border-red-500" 
                : "border-gray-200 focus:ring-primary focus:border-transparent"
            }`}
          />
          {phoneError && (
            <p className="text-xs text-red-500 mt-1 font-medium">{phoneError}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Interested Batch</label>
          <div className="relative">
            <select
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white appearance-none cursor-pointer truncate text-sm"
            >
              {batches.map((batchName) => (
                <option key={batchName} value={batchName}>
                  {batchName.length > 30 ? batchName.slice(0, 30) + "..." : batchName}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Message (Optional)</label>
          <textarea
            rows={3}
            placeholder="Tell us about your goals..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
          />
        </div>
        {captchaSvg && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Security Code
            </label>
            <div className="flex items-center gap-3 mb-2 bg-gray-50/50 p-2 rounded-xl border border-gray-200">
              <div dangerouslySetInnerHTML={{ __html: captchaSvg }} className="flex-shrink-0 animate-fadeIn" />
              <button
                type="button"
                onClick={fetchCaptcha}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Refresh
              </button>
            </div>
            <input
              required
              type="text"
              placeholder="Enter security code"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm bg-white"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          {status === "submitting" ? "Sending..." : "Send Enquiry"}
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

export default function EnquiryForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    batch: "11th Commerce",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert("Error sending enquiry. Please try again.");
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
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Interested Batch</label>
          <select
            value={formData.batch}
            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white"
          >
            <option>11th Commerce</option>
            <option>12th Commerce</option>
            <option>Other</option>
          </select>
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

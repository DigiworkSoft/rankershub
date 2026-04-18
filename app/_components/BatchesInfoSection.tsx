"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Course = {
  id: number;
  title: string;
  description: string;
  next_batch_starts?: string | null;
  fees?: number | string | null;
  discount_percent?: number | string | null;
};

const BATCH_DISPLAY_ORDER: Record<string, number> = {
  "11th Commerce Regular": 1,
  "12th Commerce Boards": 2,
  "CA Foundation Intensive": 3,
};

function toFiniteNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatIndianCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export default function BatchesInfoSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const displayCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => {
        const aOrder = BATCH_DISPLAY_ORDER[a.title] ?? Number.MAX_SAFE_INTEGER;
        const bOrder = BATCH_DISPLAY_ORDER[b.title] ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.title.localeCompare(b.title);
      })
      .slice(0, 3);
  }, [courses]);

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Our Upcoming <span className="text-primary">Batches</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Newly added batches from admin are shown here automatically.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : displayCourses.length === 0 ? (
          <p className="text-center text-gray-500">No batches available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {displayCourses.map((course, idx) => {
              const fees = toFiniteNumber(course.fees);
              const discount = toFiniteNumber(course.discount_percent) ?? 0;
              const finalFees = fees && fees > 0 ? Math.max(0, fees - (fees * Math.min(Math.max(discount, 0), 100)) / 100) : null;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {course.description || "Comprehensive coaching with expert mentorship and structured exam preparation."}
                  </p>
                  <p className="text-primary font-bold mb-4">Next Batch Starts: {course.next_batch_starts || "Admissions Open"}</p>

                  {finalFees && finalFees > 0 && (
                    <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                      <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">Course Fees</p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <p className="text-xl font-extrabold text-emerald-800">₹{formatIndianCurrency(finalFees)}</p>
                        {discount > 0 && fees && (
                          <>
                            <p className="text-sm text-gray-500 line-through">₹{formatIndianCurrency(fees)}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">Save {Math.min(Math.max(discount, 0), 100)}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <Link href="/batches" className="inline-flex text-white bg-primary hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                    View Details
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/batches" className="text-primary hover:underline font-semibold cursor-pointer">
            Click here to see all batches and course details
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
};

export default function OurCoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Our <span className="text-primary">Courses</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore our range of comprehensive commerce courses designed to help you excel.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-md border border-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-500">No courses available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-8 card-shadow hover-lift border border-indigo-50 flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                    {course.description || "Comprehensive coaching with expert mentorship and structured exam preparation."}
                  </p>
                </div>
                <div>
                  <Link
                    href="/batches"
                    className="inline-flex items-center gap-2 text-white bg-primary hover:bg-primary/90 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                  >
                    Know More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

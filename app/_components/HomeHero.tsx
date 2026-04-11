"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, Star, PlayCircle } from "lucide-react";

export default function HomeHero() {
  return (
    <section className="relative min-h-[68vh] md:min-h-[90vh] flex items-center overflow-hidden bg-white">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6 border border-secondary/50">
              <Star className="w-4 h-4 fill-primary text-primary" />
              New Batch Starting Soon - Enroll Now!
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-4 md:mb-6 tracking-tight">
              Best <span className="text-primary">Commerce</span> Classes in Pune
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-10 leading-relaxed max-w-xl">
              Join Maharashtra Board-focused 11th &amp; 12th Commerce Coaching.
              Top faculty, 3X revision, and expert mentorship for CA foundation aspirants.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
              <Link
                href="/batches"
                className="btn-primary w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                Book Your Slot Now <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg text-gray-700 hover:bg-indigo-50 transition-all border border-gray-200 hover:border-indigo-200">
                <PlayCircle className="w-6 h-6 text-primary" /> Watch Demo
              </button>
            </div>

            <div className="mt-8 md:mt-12 flex items-center gap-4 sm:gap-6 md:gap-8 border-t border-gray-100 pt-6 md:pt-8">
              <div>
                <p className="text-3xl font-bold text-primary">10k+</p>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Impacted</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-3xl font-bold text-primary">10+</p>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Expert Mentors</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/20 border-8 border-white">
              <Image
                src="/assets/student_image.png"
                alt="Students studying"
                width={600}
                height={750}
                className="w-full aspect-[4/5] object-cover"
                priority
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl z-20 border border-gray-50 hidden md:block">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Top Results</p>
                  <p className="text-lg font-bold text-gray-900">Top State Rank</p>
                </div>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt={`Student ${i}`}
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                  +50
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

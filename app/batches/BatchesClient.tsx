"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, Users, ArrowRight, Download, PlayCircle, HelpCircle, ChevronDown } from "lucide-react";
import EnquiryForm from "../_components/EnquiryForm";

const WHATSAPP_NUMBER = "919272547817";

const defaultBatches = [
  {
    id: "11th-commerce",
    title: "11th Commerce Regular",
    subtitle: "Foundation for Excellence",
    description: "A comprehensive course designed to build strong fundamentals in Accountancy, Economics, and Business Studies.",
    benefits: ["Conceptual clarity from scratch", "Regular chapter-wise tests", "Exclusive study materials", "Career guidance sessions"],
    syllabus: ["Book-keeping & Accountancy", "Economics", "Organization of Commerce", "Secretarial Practice", "Mathematics / IT"],
    duration: "1 Year",
    timing: "Morning & Evening Batches",
  },
  {
    id: "12th-commerce",
    title: "12th Commerce Boards",
    subtitle: "Target 95%+",
    description: "Intensive preparation for Board Exams with focus on scoring techniques, time management, and mock exams.",
    benefits: ["Board-specific test series", "Previous year paper solving", "One-on-one doubt sessions", "Stress management workshops"],
    syllabus: ["Advanced Accountancy", "Macro & Micro Economics", "Business Management", "Company Law Basics", "Maths / SP"],
    duration: "1 Year",
    timing: "Flexible Batches",
  },
  {
    id: "ca-foundation",
    title: "CA Foundation Intensive",
    subtitle: "Professional Gateway",
    description: "Kickstart your Chartered Accountancy journey with our focused coaching for all four papers of the CA Foundation exam.",
    benefits: ["Expert CA faculty", "Comprehensive ICAI module coverage", "Weekly mock tests", "Personalized performance tracking"],
    syllabus: ["Principles and Practice of Accounting", "Business Law & Reporting", "Maths, Statistics & LR", "Business Economics & BCK"],
    duration: "4-6 Months",
    timing: "Morning & Evening Batches",
  },
];

const defaultFaqSections = [
  {
    title: "Admission FAQs",

    items: [
      { q: "How can I take admission for 11th or 12th Commerce?", a: "You can apply online through our website or visit our institute for direct admission." },
      { q: "When does admission start?", a: "Admissions usually start after 10th and 11th results are declared." },
      { q: "Is there any entrance test for admission?", a: "No, admission is based on previous academic performance." },
      { q: "Do you offer demo lectures?", a: "Yes, we provide demo lectures before admission." },
      { q: "What documents are required for admission?", a: "Marksheet, school leaving certificate, and passport-size photos." },
    ],
  },
  {
    title: "Syllabus FAQs",

    items: [
      { q: "Do you follow the Maharashtra Board syllabus?", a: "Yes, we strictly follow the Maharashtra State Board syllabus." },
      { q: "Is the syllabus completed on time?", a: "Yes, we complete the syllabus well before exams." },
      { q: "Do you provide notes for all subjects?", a: "Yes, we provide easy-to-understand notes and study material." },
    ],
  },
  {
    title: "Subjects FAQs",
    items: [
      { q: "Which subjects are covered in Commerce?", a: "Accounts, Economics, Business Studies, Maths/IT, and Organization of Commerce." },
      { q: "Is Maths compulsory in Commerce?", a: "No, Maths is optional; you can choose IT instead." },
      { q: "Do you teach basics for weak students?", a: "Yes, we focus on strong fundamentals for all students." },
    ],
  },
];

type Video = { id: number; title: string; youtube_url: string };
type Faq = { id: number; category: string; question: string; answer: string };
type Course = { id: number; title: string; description: string };

interface BatchesClientProps {
  videos: Video[];
  faqs: Faq[];
  courses: Course[];
}

function youtubeIdFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    const v = parsed.searchParams.get("v");
    if (v) return v;
    if (parsed.pathname.includes("/shorts/")) return parsed.pathname.split("/shorts/")[1];
    return "";
  } catch {
    return "";
  }
}

export default function BatchesClient({ videos, faqs, courses }: BatchesClientProps) {
  const [openSyllabusKey, setOpenSyllabusKey] = useState<string | null>(null);
  const [openFaqKey, setOpenFaqKey] = useState<string | null>(null);

  const displayBatches = useMemo(() => {
    const dbBatches = courses.map((c) => ({
      id: `course-${c.id}`,
      title: c.title,
      subtitle: "Professional Course",
      description: c.description,
      benefits: ["Specialized curriculum", "Expert guidance", "Comprehensive material", "Recorded lectures available"],
      syllabus: ["Core Subject Focus", "Practice Modules", "Test Series"],
      duration: "Flexible",
      timing: "Contact for details",
    }));
    return [...defaultBatches, ...dbBatches];
  }, [courses]);

  const mergedFaqSections = useMemo(() => {
    const combined = defaultFaqSections.map((s) => ({ ...s, items: [...s.items] }));
    faqs.forEach((faq) => {
      let section = combined.find((s) => s.title === faq.category);
      if (!section) {
        section = { title: faq.category, items: [] };
        combined.push(section);
      }
      section.items.push({ q: faq.question, a: faq.answer });
    });
    return combined;
  }, [faqs]);

  const openWhatsAppForCourse = (courseName: string) => {
    const text = `Hi, I want to enroll in ${courseName}. Please share details.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pt-0 md:pt-4 pb-12 md:pb-20 bg-gray-50 font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-6 md:mb-10 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white">
          <picture>
            <source media="(max-width: 767px)" srcSet="/assets/photos/batch2.png" />
            <img
              src="/assets/photos/batch.png"
              alt="RankersHub Batches"
              className="w-full h-auto object-cover"
            />
          </picture>
        </div>

        {/* Header */}
        <div className="text-center mb-10 md:mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-7xl font-extrabold text-gray-900 mb-4 md:mb-6 tracking-tight"
          >
            Our Specialized <span className="text-primary">Batches</span>
          </motion.h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose the right batch to accelerate your academic growth. We offer tailored programs for 11th, 12th Commerce and Professional exams.
          </p>
        </div>

        {/* Batches */}
        <div className="space-y-10 md:space-y-24">
          {displayBatches.map((batch) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl md:rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 md:p-12 lg:p-16 space-y-6 md:space-y-8">
                  <div>
                    <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-3 uppercase tracking-wider border border-primary/20">
                      {batch.subtitle}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{batch.title}</h2>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">{batch.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary"><Clock className="w-5 h-5" /></div>
                      <div><p className="text-xs text-gray-400 font-bold uppercase">Duration</p><p className="font-bold text-gray-900">{batch.duration}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary"><Users className="w-5 h-5" /></div>
                      <div><p className="text-xs text-gray-400 font-bold uppercase">Timing</p><p className="font-bold text-gray-900">{batch.timing}</p></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-500" /> Benefits of Joining
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {batch.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />{benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-4">
                    <button onClick={() => openWhatsAppForCourse(batch.title)} className="btn-primary w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                      Enroll Now <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="bg-gray-50 text-gray-700 w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100 text-sm">
                      <Download className="w-5 h-5" /> Syllabus PDF
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 md:p-12 lg:p-16">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-full">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                      <BookOpen className="w-7 h-7 text-primary" /> Course Syllabus
                    </h3>
                    <div className="space-y-3">
                      {batch.syllabus?.map((subject, sIdx) => {
                        const key = `${batch.id}-subject-${sIdx}`;
                        const isOpen = openSyllabusKey === key;
                        return (
                          <div key={key} className="rounded-2xl border border-gray-200 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setOpenSyllabusKey(isOpen ? null : key)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-primary/5 transition-colors"
                            >
                              <span className="text-lg font-bold text-gray-800">{subject}</span>
                              <ChevronDown className={`w-5 h-5 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 text-sm text-gray-600">
                                <p>Comprehensive coverage of {subject} according to state board and professional standards.</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-12 p-6 bg-primary rounded-2xl text-white">
                      <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Next Batch Starts</p>
                      <p className="text-2xl font-bold">15th April, 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* YouTube Demo Videos */}
        <div className="mt-14 md:mt-20 bg-white rounded-[2rem] shadow-xl border border-gray-100 p-5 md:p-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
            Watch The <span className="text-primary">Demo Lectures</span>
          </h2>
          {videos.length === 0 ? (
            <p className="text-center text-gray-500">No demo videos added yet.</p>
          ) : (
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory -mx-2 px-2 md:mx-0 md:px-0">
              {videos.map((video) => {
                const videoId = youtubeIdFromUrl(video.youtube_url);
                const thumb = videoId
                  ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                  : "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000";
                return (
                  <motion.a
                    key={video.id}
                    href={video.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -4 }}
                    className="group block rounded-2xl overflow-hidden border border-gray-200 hover:border-primary/40 transition-all bg-gray-50 min-w-[88%] sm:min-w-[70%] md:min-w-0 snap-start"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="bg-red-600 text-white rounded-full p-3 group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2">{video.title}</h3>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-14 md:mt-20">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-gray-600 mt-3">Quick answers for admissions, syllabus and subjects.</p>
          </div>
          <div className="space-y-6 md:space-y-8">
            {mergedFaqSections.map((section, sectionIdx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIdx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl border border-gray-100 shadow-lg p-4 md:p-8"
              >
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
                  <span className="text-2xl"></span>{section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {section.items.map((item, i) => {
                    const key = `${section.title}-${i}`;
                    return (
                      <div key={key} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5 hover:bg-white hover:border-primary/30 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => setOpenFaqKey(openFaqKey === key ? null : key)}
                          className="w-full text-left font-bold text-gray-900 flex items-start justify-between gap-2"
                        >
                          <span className="flex items-start gap-2">
                            <HelpCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <span>{item.q}</span>
                          </span>
                          <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${openFaqKey === key ? "rotate-180" : ""}`} />
                        </button>
                        {openFaqKey === key && (
                          <p className="text-gray-600 leading-relaxed pl-7 mt-2 text-sm md:text-base">{item.a}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="mt-20 md:mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Still Confused?</h2>
            <p className="text-gray-600 mt-2">Book a free demo class today and experience the difference.</p>
          </div>
          <div className="max-w-md md:max-w-none mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}

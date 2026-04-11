import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Trophy, Star, PlayCircle } from "lucide-react";
import EnquiryForm from "./_components/EnquiryForm";
import FacultySection from "./_components/FacultySection";
import FeedbackSection from "./_components/FeedbackSection";
import HomeHero from "./_components/HomeHero";

export const metadata: Metadata = {
  title: "RankersHub — Best Commerce Classes in Pune",
  description:
    "Join Maharashtra Board-focused 11th & 12th Commerce Coaching. Top faculty, 3X revision, expert mentorship for CA/CS aspirants.",
};

const features = [
  {
    icon: BookOpen,
    title: "Conceptual Learning",
    desc: "We focus on 'Why' before 'How' to ensure students understand the core logic of commerce subjects.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Personalized Attention",
    desc: "Small batch sizes allow our faculty to focus on every student's individual progress and doubts.",
    color: "bg-secondary/20 text-primary",
  },
  {
    icon: Trophy,
    title: "Proven Results",
    desc: "Consistently producing state and city toppers in 12th Board exams for over a decade.",
    color: "bg-accent/10 text-accent",
  },
];

export default function HomePage() {
  return (
    <div className="pt-2 md:pt-6">
      {/* Top Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-1 md:mt-3 mb-1 md:mb-0">
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
          <picture>
            <source media="(max-width: 768px)" srcSet="/assets/photos/banner2.png" />
            <img src="/assets/photos/banner.png" alt="Rankershub Banner" className="w-full h-auto object-cover" />
          </picture>
        </div>
      </section>

      {/* Hero Section — uses client component for motion */}
      <HomeHero />

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Why Choose <span className="text-primary">Rankershub?</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We provide a holistic learning environment that focuses on long-term success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-[2rem] card-shadow hover-lift border border-indigo-50"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FacultySection />

      {/* Enquiry Section */}
      <section className="py-12 md:py-24 bg-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight tracking-tight">
                Ready to Start Your <span className="text-primary">Journey</span> with Us?
              </h2>
              <ul className="space-y-6">
                {[
                  "Free Career Counseling Session",
                  "Access to Premium Study Material",
                  "Weekly Performance Tracking",
                  "Doubt Solving Workshops",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg text-gray-700 font-medium">
                    <div className="w-6 h-6 bg-secondary/30 text-primary rounded-full flex items-center justify-center shrink-0">
                      <Star className="w-3 h-3 fill-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <EnquiryForm />
          </div>
        </div>
      </section>

      <FeedbackSection />
    </div>
  );
}

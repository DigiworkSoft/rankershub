"use client";

import { motion } from "framer-motion";
import {
  Target, Eye, Award, BookOpen, Users, TrendingUp,
} from "lucide-react";

const features = [
  { icon: Users, title: "Expert Faculty", description: "Learn from highly experienced and dedicated commerce professionals." },
  { icon: BookOpen, title: "Modern Methods", description: "Interactive and conceptual learning approach for better retention." },
  { icon: Target, title: "Proven Results", description: "Consistent track record of toppers in board and entrance exams." },
  { icon: Award, title: "Holistic Growth", description: "Focus on overall student development alongside academic excellence." },
];

export default function AboutClient() {
  return (
    <div className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-20 block">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            About <span className="text-primary">RankerHub</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Building futures through quality commerce education since 2026.
          </motion.p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 cursor-default">
          {[
            { icon: Target, title: "Our Mission", text: "To provide exceptional commerce education that empowers students to achieve academic excellence and build successful careers in business and commerce fields." },
            { icon: Eye, title: "Our Vision", text: "To be the most trusted and preferred commerce coaching institute, recognized for quality education, innovation, and holistic student development." },
            { icon: Award, title: "Our Values", text: "Excellence, integrity, innovation, and a student-centric approach guide everything we do. We believe in nurturing talent and building character." },
          ].map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl shadow-primary/20 hover-lift"
            >
              <Icon className="w-12 h-12 mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-4">{title}</h3>
              <p className="text-white/80 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Why Choose <span className="text-primary">RankerHub?</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide the best learning environment with modern teaching methodologies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 hover-lift group"
              >
                <div className="mx-auto w-20 h-20 bg-indigo-50 text-primary flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              What We <span className="text-primary">Offer</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive learning solutions for commerce students</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Complete Study Material", desc: "Comprehensive notes, practice papers, and previous year question banks for thorough preparation." },
              { icon: Users, title: "Expert Faculty", desc: "Highly qualified teachers with years of experience in commerce education and board exam patterns." },
              { icon: TrendingUp, title: "Regular Assessment", desc: "Weekly tests, mock exams, and continuous evaluation to track progress and identify improvement areas." },
              { icon: Award, title: "Personalized Attention", desc: "Small batch sizes ensure individual attention and personalized learning experience for each student." },
              { icon: Target, title: "Doubt Clearing Sessions", desc: "Dedicated doubt clearing classes and one-on-one sessions to ensure complete understanding of concepts." },
              { icon: Eye, title: "Parent Engagement", desc: "Regular parent-teacher meetings and progress reports to keep parents informed about their child's development." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-50 hover-lift group"
              >
                <div className="w-14 h-14 bg-indigo-50 text-primary flex items-center justify-center rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

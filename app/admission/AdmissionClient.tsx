"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Users, Calendar, IndianRupee, Book, CheckCircle, Award, Phone, X, Send } from "lucide-react";

const admissionSteps = [
  { step: 1, title: "Enquiry", description: "Fill out the enquiry form or visit our center for information", icon: FileText },
  { step: 2, title: "Counseling", description: "Attend a counseling session to understand our courses and batches", icon: Users },
  { step: 3, title: "Batch Selection", description: "Choose the batch that suits your schedule and preferences", icon: Calendar },
  { step: 4, title: "Documentation", description: "Submit required documents and fill admission form", icon: FileText },
  { step: 5, title: "Fee Payment", description: "Pay the registration and first month's fee", icon: IndianRupee },
  { step: 6, title: "Start Learning", description: "Begin your journey towards academic excellence", icon: Book },
];

const eligibility = [
  "Students who have completed or are pursuing 10th/11th standard",
  "Commerce stream students (11th and 12th)",
  "Students from CBSE, ICSE, or State boards",
  "Minimum 60% marks in previous class (recommended)",
];

const documents = [
  "Recent passport-size photographs (2 copies)",
  "Photocopy of previous year's mark sheet",
  "Photocopy of school ID card",
  "Address proof (Aadhar card/Voter ID/Passport)",
  "Parent/Guardian ID proof",
];

const feeStructure = [
  { category: "11th Commerce", registrationFee: "₹1,000", monthlyFee: "₹15,000", description: "Complete course for 11th standard commerce students" },
  { category: "12th Commerce", registrationFee: "₹1,000", monthlyFee: "₹15,000", description: "Complete course for 12th standard commerce students" },
  { category: "Weekend Batch", registrationFee: "₹1,000", monthlyFee: "₹12,000", description: "Special weekend batch (Saturday & Sunday)" },
];

const benefits = [
  "Study materials and notes included",
  "Access to online resources and videos",
  "Regular tests and assessments",
  "Doubt clearing sessions",
  "Mock exams before board exams",
  "Parent-teacher meetings",
  "Performance reports",
  "Career guidance and counseling",
];

export default function AdmissionClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_selectedCourse, setSelectedCourse] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    message: "",
  });

  const openModal = (course: string) => {
    setSelectedCourse(course);
    setFormData((prev) => ({ ...prev, course }));
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
    setFormData({ name: "", phone: "", email: "", course: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `*Enrollment Enquiry - RankerHub*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Email:* ${formData.email}%0A*Course:* ${formData.course}%0A*Message:* ${formData.message || "N/A"}`;
    const whatsappUrl = `https://wa.me/919272547817?text=${whatsappMessage}`;
    closeModal();
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-20">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Admission <span className="text-primary">Details</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join RankerHub Commerce Classes and take the first step towards your success.
          </motion.p>
        </div>

        {/* Admission Process */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Admission <span className="text-primary">Process</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Simple and straightforward admission process in just 6 easy steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {admissionSteps.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-50 hover-lift group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-secondary text-white font-black rounded-full flex items-center justify-center text-xl shadow-lg border-4 border-white z-10 group-hover:scale-110 transition-transform">{item.step}</div>
                <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Eligibility & Documents */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-primary p-12 rounded-[3rem] text-white shadow-2xl shadow-primary/20 hover-lift">
            <h2 className="text-3xl font-bold mb-8">Eligibility Criteria</h2>
            <ul className="space-y-4">
              {eligibility.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                  <span className="text-white/90 text-lg leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-indigo-900 p-12 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/20 hover-lift">
            <h2 className="text-3xl font-bold mb-8">Required Documents</h2>
            <ul className="space-y-4">
              {documents.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                  <span className="text-white/90 text-lg leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Fee Structure */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Fee <span className="text-primary">Structure</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Transparent and competitive pricing for quality education</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {feeStructure.map((fee, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 hover-lift flex flex-col">
                <div className="bg-primary text-white p-8 text-center">
                  <h3 className="text-2xl font-bold">{fee.category}</h3>
                </div>
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <span className="text-gray-600 font-medium tracking-wide text-sm uppercase">Registration</span>
                      <span className="text-xl font-bold text-gray-900">{fee.registrationFee}</span>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-gray-600 font-medium tracking-wide text-sm uppercase">Monthly</span>
                      <span className="text-3xl font-black text-primary">{fee.monthlyFee}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed mt-6 mb-8 text-sm">{fee.description}</p>
                  </div>
                  <button
                    onClick={() => openModal(fee.category)}
                    className="block w-full bg-secondary text-primary font-bold tracking-widest uppercase text-center py-4 rounded-full hover:bg-primary hover:text-white transition-all shadow-md mt-auto cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-slate-50 border border-indigo-100 rounded-[2rem] p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl font-bold mb-8 text-gray-900">Available Discounts</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[{ title: "Sibling Discount", val: "10% off" }, { title: "Early Bird", val: "15% off (Ltd)" }, { title: "Merit Scholarship", val: "Up to 20% off" }].map((d) => (
                <div key={d.title} className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                  <div className="w-12 h-12 bg-indigo-50 text-secondary rounded-xl flex items-center justify-center shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold mb-1">{d.title}</p>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide">{d.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* What's Included */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">What&apos;s <span className="text-primary">Included</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive package for a complete learning experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg shadow-gray-200/40 p-6 border border-gray-50 flex items-start gap-3 hover-lift">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <span className="text-gray-700 font-medium leading-relaxed">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-primary rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 font-bold">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 text-secondary">
              <Phone className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Need Help with Admission?</h2>
            <p className="text-white/80 mb-10 max-w-2xl mx-auto text-lg font-medium leading-relaxed">Our admission counselors are here to help you. Contact us for any queries or visit our center.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="tel:+919272547817" className="bg-secondary text-primary font-black tracking-widest uppercase px-10 py-4 rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl">Call +91 92725 47817</a>
              <a href="/contact" className="border-2 border-white/30 text-white font-bold tracking-widest uppercase px-10 py-4 rounded-full hover:bg-white/10 hover:border-white transition-all">Send Enquiry</a>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Enrollment Enquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-primary to-indigo-800 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2" />
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Enrollment Enquiry</h3>
                  <p className="text-white/70 text-sm font-medium">Fill in your details and we&apos;ll connect with you on WhatsApp</p>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold tracking-wide py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 cursor-pointer text-sm uppercase"
                >
                  <Send className="h-5 w-5" />
                  Submit & Connect on WhatsApp
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">
                  You will be redirected to WhatsApp to complete your enquiry
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

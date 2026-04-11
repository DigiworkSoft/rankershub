"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import EnquiryForm from "../_components/EnquiryForm";

export default function ContactClient() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            Get in <span className="text-primary">Touch</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions about our batches or curriculum? Reach out to us
            and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Phone Number</p>
                    <p className="text-lg font-bold text-gray-900">+91 9272547817</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Email Address</p>
                    <p className="text-lg font-bold text-gray-900">info@rankerhub.com</p>
                    <p className="text-sm text-gray-500">admissions@rankerhub.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Our Location</p>
                    <p className="text-lg font-bold text-gray-900 leading-tight">
                      Tilak Road, 1st Floor, Pinnacle Pride, Near Durvankur Dining Hall, Above Maharashtra Electronics, Opposite Cosmos Bank, Sadashiv Peth, Pune, Maharashtra 411030
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-3xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-secondary" />
                <h4 className="text-xl font-bold">Office Hours</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <span className="text-gray-400">Mon - Sat</span>
                  <span className="font-bold">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sunday</span>
                  <span className="font-bold text-secondary">Closed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <EnquiryForm />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-white p-4 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 md:px-8 gap-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="text-primary w-6 h-6" /> Find Us on Maps
              </h3>
              <a
                href="https://maps.app.goo.gl/3uBsnJy2ZPHKtH5b8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/5 border border-primary/20 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 px-8 py-3 rounded-full text-sm font-black transition-all uppercase tracking-widest text-center"
              >
                Open in App
              </a>
            </div>
            <div className="w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden bg-gray-50 relative group">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10" />
              <iframe
                src="https://maps.google.com/maps?q=Tilak+Road,+1st+Floor,+Pinnacle+Pride,+Sadashiv+Peth,+Pune,+Maharashtra+411030&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full md:grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

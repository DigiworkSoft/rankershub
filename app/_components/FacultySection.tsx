"use client";

import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";
import Image from "next/image";

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const faculty = [
  {
    name: "Prof. Mukesh Jain",
    role: "Math Expert",
    experience: "18+ Years",
    image: "/assets/photos/image1.png",
    bio: "Specialist in Mathematics and Statistics, known for making complex calculations simple and intuitive.",
    whatsapp: "https://wa.me/919823789495",
    linkedin: "https://www.linkedin.com/in/mukesh-ch-jain/",
  },
  {
    name: "Prof. Shivram R. Gadgil",
    role: "Accountancy Expert",
    experience: "7+ Years",
    image: "/assets/photos/image2.jpeg",
    bio: "Renowned expert in Accountancy with over two decades of experience in mentoring commerce toppers.",
    whatsapp: "https://wa.me/919272547817",
    linkedin: "https://www.linkedin.com/in/ca-cs-cma-shivram-gadgil-601721173/",
  },
];

export default function FacultySection() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Meet Our Expert <span className="text-primary">Faculty</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team of dedicated educators brings years of academic and professional
            experience to help you master every subject.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {faculty.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-transparent hover:border-primary/20"
            >
              <div className="relative mb-6 overflow-hidden rounded-2xl aspect-square card-shadow">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-4">
                  <a href={member.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-indigo-900 transition-all">
                    <WhatsappIcon className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-indigo-900 transition-all">
                    <Mail className="w-4 h-4" />
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-indigo-900 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-primary text-sm font-bold mb-3">{member.role}</p>
              <p className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-widest">{member.experience} Experience</p>
              <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

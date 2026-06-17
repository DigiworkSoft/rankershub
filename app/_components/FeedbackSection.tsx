"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const feedbacks = [
  {
    name: "Sahil Agrawal",
    text: "joined here for 12th commerce… didn't expect much at first but classes turned out pretty good… accounts teaching is clear and not too fast… maths also manageable after joining… notes they give are helpful for exams… overall nice experience till now 👍 …",
    image: "/assets/S.png",
  },
  {
    name: "Omkar Kumbhar",
    text: "My brother had taken admission here in Rankers Hub… Earlier he didn't understand Accounts at all honestly 😅 But after teaching here, everything gradually became clear… Maths was okay for him. Teachers are also good, if you ever ask a doubt, they explain. Overall, he got a lot of help from here 👍 …",
    image: "/assets/O.png",
  },
  {
    name: "Sanket Mali",
    text: "Joined RankersHub for 11th commerce and honestly it's worth it. Accounts and Economics they teach very clearly, even difficult topics are explained in simple way. Teachers are chill but at the same time strict about studies.",
    image: "/assets/S.png",
  },
  {
    name: "Tejashri Jain",
    text: "Best place for commerce students in 11th and 12th. The teaching style is simple and easy to follow. Doubt-solving sessions are very helpful and teachers are friendly.",
    image: "/assets/T.png",
  },
];

export default function FeedbackSection() {
  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">
            What Our <span className="text-primary">Students</span> Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Success stories from our bright students who achieved their dreams with Rankerhub.
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
          {feedbacks.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              className="bg-white p-5 md:p-8 rounded-3xl card-shadow hover-lift relative border border-indigo-50 min-w-[88%] sm:min-w-[72%] md:min-w-0 snap-start"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-primary opacity-10" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 md:mb-8 leading-relaxed text-sm md:text-base">&ldquo;{item.text}&rdquo;</p>
              <div className="flex items-center gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border-2 border-indigo-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500">Student • <span className="text-primary font-bold">Commerce</span></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

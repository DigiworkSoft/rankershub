"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles } from "lucide-react";

type FeePlan = {
  id: number;
  course_id: number;
  course_title?: string;
  duration: string;
  fees: string | number;
  discount_percent: string | number;
  mode_of_learning?: string | null;
};

function getModeBadgeClass(mode?: string | null): string {
  const m = String(mode || "Offline (Hybrid )").toLowerCase();
  if (m.includes("online")) {
    return "text-indigo-700 bg-indigo-50 border-indigo-100";
  } else if (m.includes("recorded")) {
    return "text-amber-700 bg-amber-50 border-amber-100";
  } else {
    return "text-emerald-700 bg-emerald-50 border-emerald-100";
  }
}

export default function FeePlansSection() {
  const [plans, setPlans] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fee-plans")
      .then((res) => res.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  function formatIndianCurrency(value: number): string {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  }

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Our Flexible <span className="text-primary">Fee Plans</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Invest in your future with our affordable, high-value commerce coaching plans.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[0, 1].map((idx) => (
              <div key={idx} className="bg-gray-50 rounded-[2.5rem] p-8 shadow-md border border-gray-100 animate-pulse h-80" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <p className="text-center text-gray-500">No fee plans available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, idx) => {
              const originalFees = Number(plan.fees);
              const discountPercent = Number(plan.discount_percent);
              const discountAmount = (originalFees * discountPercent) / 100;
              const finalFees = originalFees - discountAmount;
              const monthlyEquivalent = finalFees / (plan.duration.toLowerCase().includes("2") ? 24 : 12);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className={`relative bg-gray-50/50 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between h-full group ${
                    idx === 1 
                      ? "border-primary/30 shadow-lg ring-1 ring-primary/15 bg-white" 
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {idx === 1 && (
                    <div className="absolute -top-4 right-8 bg-gradient-to-r from-primary to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Best Value
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm uppercase tracking-widest text-primary font-bold">
                        {plan.course_title || "General"} Program
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getModeBadgeClass(plan.mode_of_learning)}`}>
                        {plan.mode_of_learning || "Offline (Hybrid )"}
                      </span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2 mb-6">
                      {plan.duration} Plan
                    </h3>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                          ₹{formatIndianCurrency(finalFees)}
                        </span>
                        <span className="text-gray-500 text-sm font-semibold">total</span>
                      </div>
                      
                      {discountPercent > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 line-through text-lg">
                            ₹{formatIndianCurrency(originalFees)}
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                            Save {discountPercent}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-gray-200/80 my-6" />

                    <ul className="space-y-4 mb-8">
                      {[
                        "Complete Syllabus Coverage",
                        "Weekly Mock Tests & Performance Review",
                        "Premium Hardcopy Study Material",
                        "Personalized Mentorship Support",
                        `Approx. ₹${formatIndianCurrency(monthlyEquivalent)} / month equivalent`
                      ].map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3 text-gray-700 text-sm font-medium">
                          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    <Link
                      href="/admission"
                      className={`w-full py-4 rounded-2xl font-bold text-center transition-all duration-300 ${
                        idx === 1
                          ? "bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      Enroll Now
                    </Link>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      100% Satisfaction Guarantee
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

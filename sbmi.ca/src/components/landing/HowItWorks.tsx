"use client";

import { motion } from "framer-motion";
import { FileText, UserCheck, HandHeart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Apply to Join",
    description:
      "Submit an application expressing your interest in becoming a member.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Become an Active Member",
    description:
      "Participate through regular contributions based on agreed community guidelines.",
  },
  {
    number: "03",
    icon: HandHeart,
    title: "Receive Support When Needed",
    description:
      "Access financial and community support during bereavement or emergencies.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#C9A227]" />
            <span className="text-sm tracking-[0.2em] text-[#C9A227] uppercase font-medium">
              Process
            </span>
            <div className="h-px w-8 bg-[#C9A227]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1B4332] leading-tight">
            How Membership Works
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-[#E8E4DE]">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#C9A227] rotate-45" />
                </div>
              )}

              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-32 h-32 mb-8 relative">
                  <div className="absolute inset-0 border border-[#E8E4DE] rotate-45" />
                  <div className="absolute inset-3 bg-[#FAF8F5] rotate-45" />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-3xl font-serif text-[#C9A227]">
                      {step.number}
                    </span>
                    <step.icon className="w-6 h-6 text-[#1B4332] mt-1" />
                  </div>
                </div>

                <h3 className="text-xl font-medium text-[#1B4332] mb-4">
                  {step.title}
                </h3>

                <p className="text-[#3D5A4C]/80 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

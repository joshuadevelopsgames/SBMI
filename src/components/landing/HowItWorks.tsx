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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A43A]/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#D4A43A]" />
            <span className="text-sm tracking-[0.2em] text-[#D4A43A] uppercase font-medium">
              Process
            </span>
            <div className="h-px w-8 bg-[#D4A43A]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#0F3D2C] leading-tight">
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
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-[#E2DCD2]">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#D4A43A] rotate-45" />
                </div>
              )}

              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-32 h-32 mb-8 relative">
                  <div className="absolute inset-0 border border-[#E2DCD2] rotate-45" />
                  <div className="absolute inset-3 bg-[#FAF7F0] rotate-45" />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-3xl font-serif text-[#D4A43A]">
                      {step.number}
                    </span>
                    <step.icon className="w-6 h-6 text-[#0F3D2C] mt-1" />
                  </div>
                </div>

                <h3 className="text-xl font-medium text-[#0F3D2C] mb-4">
                  {step.title}
                </h3>

                <p className="text-[#3D5A4A]/80 leading-relaxed max-w-xs mx-auto">
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

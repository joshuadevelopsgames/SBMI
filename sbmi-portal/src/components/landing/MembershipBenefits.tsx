"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Users,
  Eye,
  Home,
  Sparkles,
  LucideIcon,
} from "lucide-react";

const benefits: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Heart,
    title: "Financial Support",
    description:
      "Assistance during bereavement and emergencies when you need it most",
  },
  {
    icon: Shield,
    title: "Structured System",
    description: "A trusted and organized contribution framework for all members",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Emotional and practical support from fellow members in times of need",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Clear accountability and shared governance in all decisions",
  },
  {
    icon: Home,
    title: "Cultural Continuity",
    description: "Preserving Ethiopian traditions and values in Calgary",
  },
  {
    icon: Sparkles,
    title: "Belonging",
    description: "A strong sense of community and meaningful connection",
  },
];

export default function MembershipBenefits() {
  return (
    <section className="py-24 md:py-32 bg-[#FAF8F5]">
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
              Membership
            </span>
            <div className="h-px w-8 bg-[#C9A227]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1B4332] leading-tight">
            Benefits of Membership
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white p-8 h-full border border-[#E8E4DE] hover:border-[#C9A227]/30 transition-all duration-500 hover:shadow-lg hover:shadow-[#C9A227]/5">
                <div className="w-12 h-12 bg-[#1B4332] flex items-center justify-center mb-6 group-hover:bg-[#C9A227] transition-colors duration-500">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-lg font-medium text-[#1B4332] mb-3">
                  {benefit.title}
                </h3>

                <p className="text-[#3D5A4C]/80 leading-relaxed text-sm">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

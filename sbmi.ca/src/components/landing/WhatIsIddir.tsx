"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Image from "next/image";

export default function WhatIsIddir() {
  return (
    <section className="py-24 md:py-32 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#D4A43A]" />
              <span className="text-sm tracking-[0.2em] text-[#D4A43A] uppercase font-medium">
                Tradition
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#0F3D2C] mb-8 leading-tight">
              What Is an Iddir?
            </h2>

            <div className="space-y-6 text-[#3D5A4A] leading-relaxed">
              <p>
                An Iddir is a traditional Ethiopian community-based mutual aid association.
                Members come together to support one another financially and emotionally
                during times of loss, emergencies, and hardship.
              </p>
              <p>
                Rooted in shared responsibility, trust, and dignity, an Iddir ensures that
                no family faces difficult moments alone. This tradition continues in Calgary
                as a way of preserving community values while supporting families in a modern
                Canadian context.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] relative">
              <div className="absolute -inset-4 border border-[#D4A43A]/20" />
              <div className="relative h-full bg-gradient-to-br from-[#1B5E3B] to-[#0F3D2C] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
                  alt="Ethiopian community gathering"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                />
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A227' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 20L20 0v20H0zm20 0v20h20L20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
                <div className="absolute bottom-6 right-6 bg-[#D4A43A] p-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

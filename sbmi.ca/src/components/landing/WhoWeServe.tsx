"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function WhoWeServe() {
  return (
    <section className="py-24 md:py-32 bg-[#FAF7F0] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 md:order-1"
          >
            <div className="aspect-square relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 border border-[#D4A43A]/30" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#D4A43A]/10" />

              <div className="relative h-full bg-[#1B5E3B] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80"
                  alt="Family gathering"
                  width={800}
                  height={800}
                  className="w-full h-full object-cover opacity-70"
                />

                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-5 py-3 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#D4A43A]" />
                  <span className="text-sm font-medium text-[#0F3D2C]">
                    Calgary, Alberta
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#D4A43A]" />
              <span className="text-sm tracking-[0.2em] text-[#D4A43A] uppercase font-medium">
                Community
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#0F3D2C] mb-8 leading-tight">
              Who We Serve
            </h2>

            <div className="space-y-6 text-[#3D5A4A] leading-relaxed">
              <p>
                Samuel Bete Iddir serves Ethiopian and Eritrean individuals and families
                living in Calgary and surrounding areas. Members typically represent
                households and extended families.
              </p>
              <p>
                Membership is open to those who value responsibility, trust, and mutual
                support within a respectful and organized community structure.
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-[#E2DCD2] grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl md:text-4xl font-serif text-[#D4A43A] mb-2">
                  15+
                </div>
                <div className="text-sm text-[#3D5A4A]/70">Years Serving Calgary</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif text-[#D4A43A] mb-2">
                  800+
                </div>
                <div className="text-sm text-[#3D5A4A]/70">Families Supported</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

export default function OurStory() {
  return (
    <section className="py-24 md:py-32 bg-[#1B4332] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C9A227' stroke-width='1'%3E%3Cpath d='M0 40h80M40 0v80M0 0l80 80M80 0L0 80'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#C9A227]/40" />
            <span className="text-sm tracking-[0.2em] text-[#C9A227] uppercase font-medium">
              Our Story
            </span>
            <div className="h-px w-16 bg-[#C9A227]/40" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-12 leading-tight">
            Why Samuel Bete Iddir Exists
          </h2>

          <div className="space-y-8 text-white/80 leading-relaxed text-base md:text-lg">
            <p>
              Samuel Bete Iddir was founded over 15 years ago by Ethiopian and Eritrean
              community members in Calgary.
            </p>
            <p>
              The association is named in memory of Samuel Bete, a young boy born to a
              refugee family whose tragic passing deeply affected the community. His story
              inspired the creation of an organization dedicated to compassion, mutual care,
              and long-term support for families during life&apos;s most difficult moments.
            </p>
          </div>

          <div className="mt-16 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#C9A227] rotate-45" />
            <div className="w-2 h-2 bg-[#C9A227]/60 rotate-45" />
            <div className="w-2 h-2 bg-[#C9A227]/30 rotate-45" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

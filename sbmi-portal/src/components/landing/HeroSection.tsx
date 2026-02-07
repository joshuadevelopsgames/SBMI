"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  onApplyClick: () => void;
  onContactClick: () => void;
};

export default function HeroSection({ onApplyClick, onContactClick }: Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] via-[#2D5A45] to-[#1B4332]">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#C9A227]/60" />
            <Users className="w-5 h-5 text-[#C9A227]" />
            <div className="h-px w-12 bg-[#C9A227]/60" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white tracking-tight mb-6">
            Samuel Bete Iddir
          </h1>

          <p className="text-lg md:text-xl text-[#C9A227] font-light tracking-wide mb-6">
            A community of mutual support, solidarity, and care in Calgary
          </p>

          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            A trusted Ethiopian mutual aid association serving families in Calgary, Alberta for over 15 years.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={onApplyClick}
              className="bg-[#C9A227] hover:bg-[#B8922A] text-[#1B4332] font-medium px-8 py-6 text-base rounded-none tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A227]/20"
            >
              Apply to Join
            </Button>
            <Button
              onClick={onContactClick}
              className="bg-[#2D5A45] hover:bg-[#1B4332] text-white px-8 py-6 text-base rounded-none tracking-wide transition-all duration-300"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="mt-20 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-white/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

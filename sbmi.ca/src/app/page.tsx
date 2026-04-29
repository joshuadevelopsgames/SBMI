"use client";

import { useRef } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import WhatIsIddir from "@/components/landing/WhatIsIddir";
import OurStory from "@/components/landing/OurStory";
import MembershipBenefits from "@/components/landing/MembershipBenefits";
import HowItWorks from "@/components/landing/HowItWorks";
import WhoWeServe from "@/components/landing/WhoWeServe";
import ApplicationForm from "@/components/landing/ApplicationForm";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 bg-[#D4A43A] hover:bg-[#C4922E] text-[#171717] px-6 py-2.5 rounded-xl shadow-lg font-semibold tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-[#D4A43A]/30 hover:-translate-y-0.5"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Link>
      </div>

      <HeroSection onApplyClick={scrollToForm} />
      <WhatIsIddir />
      <OurStory />
      <MembershipBenefits />
      <HowItWorks />
      <WhoWeServe />
      <ApplicationForm formRef={formRef} />
      <Footer />
    </div>
  );
}

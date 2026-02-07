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
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B8922A] text-[#1B4332] px-6 py-2 rounded-none shadow-lg font-medium transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Link>
      </div>

      <HeroSection onApplyClick={scrollToForm} onContactClick={scrollToForm} />
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

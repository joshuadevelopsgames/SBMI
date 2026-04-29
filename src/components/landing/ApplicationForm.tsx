"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import {
  MEMBERSHIP_CATEGORY_OPTIONS,
  type MembershipCategoryCode,
} from "@/lib/membership-categories";

type FormRef = React.RefObject<HTMLElement | null>;

const inputClass =
  "border-[#E2DCD2] focus:border-[#D4A43A] focus:ring-[#D4A43A]/20 rounded-lg h-12";
const selectClass =
  "flex h-12 w-full rounded-lg border border-[#E2DCD2] bg-white px-3 py-2 text-sm text-[#171717] focus:border-[#D4A43A] focus:outline-none focus:ring-2 focus:ring-[#D4A43A]/20";

export default function ApplicationForm({ formRef }: { formRef: FormRef }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    household_size: "",
    proposed_category: (MEMBERSHIP_CATEGORY_OPTIONS[0]?.code ??
      "FULL_INDIVIDUAL") as MembershipCategoryCode,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          household_size: formData.household_size.trim(),
          proposed_category: formData.proposed_category,
          message: formData.message.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setIsSubmitted(true);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        household_size: "",
        proposed_category: MEMBERSHIP_CATEGORY_OPTIONS[0]?.code ?? "FULL_INDIVIDUAL",
        message: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={formRef}
      className="py-24 md:py-32 bg-[#0F3D2C] relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#D4A43A]/40" />
            <span className="text-sm tracking-[0.2em] text-[#D4A43A] uppercase font-medium">
              Join Us
            </span>
            <div className="h-px w-12 bg-[#D4A43A]/40" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-tight">
            Apply to Join
          </h2>
          <p className="mt-4 text-sm text-white/60 max-w-md mx-auto">
            No payment is required at this stage. The Executive Committee reviews every application.
          </p>
        </motion.div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 text-center rounded-xl"
          >
            <div className="w-16 h-16 bg-[#0F3D2C] mx-auto flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-[#D4A43A]" />
            </div>
            <h3 className="text-2xl font-serif text-[#171717] mb-4">
              Application Received
            </h3>
            <p className="text-[#3D5A4A]/80">
              Thank you for your interest in joining Samuel Bete Iddir. A
              representative will contact you with next steps.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white p-8 md:p-10 rounded-xl"
          >
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="full_name"
                  className="text-[#171717] font-medium mb-2 block"
                >
                  Full Name <span className="text-[#D4A43A]">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-[#171717] font-medium mb-2 block">
                  Address <span className="text-[#D4A43A]">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Street, city, postal code (Calgary area)"
                />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-[#171717] font-medium mb-2 block"
                >
                  Email Address <span className="text-[#D4A43A]">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="text-[#171717] font-medium mb-2 block"
                >
                  Phone Number <span className="text-[#D4A43A]">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="(403) 000-0000"
                />
              </div>

              <div>
                <Label htmlFor="household_size" className="text-[#171717] font-medium mb-2 block">
                  Family composition <span className="text-[#D4A43A]">*</span>
                </Label>
                <Input
                  id="household_size"
                  name="household_size"
                  value={formData.household_size}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. 2 adults, 2 children"
                />
              </div>

              <div>
                <Label htmlFor="proposed_category" className="text-[#171717] font-medium mb-2 block">
                  Proposed membership category <span className="text-[#D4A43A]">*</span>
                </Label>
                <select
                  id="proposed_category"
                  name="proposed_category"
                  value={formData.proposed_category}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  {MEMBERSHIP_CATEGORY_OPTIONS.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label
                  htmlFor="message"
                  className="text-[#171717] font-medium mb-2 block"
                >
                  Message{" "}
                  <span className="text-[#3D5A4A]/50 text-sm font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="border-[#E2DCD2] focus:border-[#D4A43A] focus:ring-[#D4A43A]/20 rounded-lg resize-none"
                  placeholder="Anything else you would like us to know…"
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D4A43A] hover:bg-[#C4922E] text-[#171717] font-medium h-12 rounded-lg tracking-wide transition-all duration-300 shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-[#3D5A4A]/60">
                All inquiries are kept confidential. A representative will contact
                you with next steps.
              </p>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}

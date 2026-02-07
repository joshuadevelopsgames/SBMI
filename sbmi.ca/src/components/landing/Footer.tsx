"use client";

import { Mail, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F261A] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-serif text-white mb-4">
              Samuel Bete Iddir
            </h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm">
              A traditional Ethiopian mutual aid association preserving
              community values and supporting families in Calgary.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                <span>Calgary, Alberta, Canada</span>
              </div>
              <a
                href="mailto:sbmi2011@outlook.com"
                className="flex items-center gap-3 text-white/60 text-sm hover:text-[#C9A227] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#C9A227]" />
                <span>sbmi2011@outlook.com</span>
              </a>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="inline-flex items-center gap-2 text-[#C9A227] mb-4">
              <div className="h-px w-8 bg-[#C9A227]/40" />
              <Heart className="w-4 h-4" />
              <div className="h-px w-8 bg-[#C9A227]/40" />
            </div>
            <p className="text-xl md:text-2xl font-serif text-white/90 italic">
              &ldquo;Built on solidarity.
              <br />
              Sustained by community.&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-white/30 text-sm">
            © {new Date().getFullYear()} Samuel Bete Iddir. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

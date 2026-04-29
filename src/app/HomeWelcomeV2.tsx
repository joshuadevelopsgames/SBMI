"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MEMBERSHIP_CATEGORY_OPTIONS,
  type MembershipCategoryCode,
} from "@/lib/membership-categories";

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  household_size: string;
  proposed_category: MembershipCategoryCode;
  message: string;
}

interface FormErrors {
  [key: string]: string
}

export default function HomeWelcomeV2() {
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    household_size: "",
    proposed_category: MEMBERSHIP_CATEGORY_OPTIONS[0]?.code ?? "FULL_INDIVIDUAL",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Fixed nav overlaps section tops; native #hash scroll alone is unreliable with overlay nav + Next hydration — scroll explicitly. */
  const scrollToSection = useCallback((hash: string, closeMobileMenu?: boolean) => {
    const id = hash.replace(/^#/, "");
    const el = document.getElementById(id);
    if (el) {
      window.history.replaceState(null, "", `#${id}`);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (closeMobileMenu) setMenuOpen(false);
  }, []);

  useEffect(() => {
    const runFromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    };
    runFromHash();
    window.addEventListener("hashchange", runFromHash);
    return () => window.removeEventListener("hashchange", runFromHash);
  }, []);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required.";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required.";
    if (!formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) errs.phone = "Phone number is required.";
    if (!formData.address.trim()) errs.address = "Address is required.";
    if (!formData.city.trim()) errs.city = "City is required.";
    if (!formData.province.trim()) errs.province = "Province is required.";
    if (!formData.postalCode.trim()) errs.postalCode = "Postal code is required.";
    if (!formData.household_size.trim()) errs.household_size = "Family composition is required.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError("");
    try {
      const full_name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const address = [formData.address.trim(), formData.city.trim(), formData.province.trim(), formData.postalCode.trim()]
        .filter(Boolean)
        .join(", ");
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address,
          household_size: formData.household_size.trim(),
          proposed_category: formData.proposed_category,
          message: formData.message.trim() || undefined,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError((typeof data.error === "string" ? data.error : null) || "Submission failed. Please try again.");
      }
    } catch {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div>

      {/* ─── NAVIGATION ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.08)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
            <div style={{
              width: 44,
              height: 44,
              background: 'var(--color-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                color: 'white',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.06em',
                fontFamily: 'var(--font-sans)',
              }}>SBMI</span>
            </div>
            <div>
              <div style={{
                fontWeight: 700,
                fontSize: 15,
                color: scrolled ? 'var(--color-gray-900)' : 'white',
                lineHeight: 1.2,
                transition: 'color 0.3s',
              }}>
                Samuel Bete Mutual Iddir
              </div>
              <div style={{
                fontSize: 10,
                color: scrolled ? 'var(--color-gray-400)' : 'rgba(255,255,255,0.6)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
              }}>
                Calgary, Alberta
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="desktop-nav">
            {[
              { href: '#about', label: 'About' },
              { href: '#memorial', label: 'Our Story' },
              { href: '#benefits', label: 'Benefits' },
              { href: '#apply', label: 'Join' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: scrolled ? 'var(--color-gray-700)' : 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  transition: 'color 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className={`btn ${scrolled ? "btn-v2-nav-solid" : "btn-v2-nav-ghost"}`}
              style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              Member Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'none',
            }}
            aria-label="Toggle menu"
          >
            <div style={{ width: 24, height: 2, background: scrolled ? '#111' : 'white', marginBottom: 5, transition: 'background 0.3s' }} />
            <div style={{ width: 24, height: 2, background: scrolled ? '#111' : 'white', marginBottom: 5, transition: 'background 0.3s' }} />
            <div style={{ width: 24, height: 2, background: scrolled ? '#111' : 'white', transition: 'background 0.3s' }} />
          </button>
        </div>

        {/* Ethiopian flag bar */}
        <div className="flag-bar">
          <div />
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 199,
          background: 'rgba(27,94,32,0.98)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 28 }}>✕</button>
          {[
            { href: '#about', label: 'About' },
            { href: '#memorial', label: 'Our Story' },
            { href: '#benefits', label: 'Benefits' },
            { href: '#apply', label: 'Join' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href, true);
              }}
              style={{ fontSize: 28, fontWeight: 600, color: 'white', textDecoration: 'none', fontFamily: 'var(--font-serif)' }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="btn btn-v2-gold"
            style={{ marginTop: 8, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Member Login
          </Link>
        </div>
      )}

      {/* ─── HERO — Full-bleed photo with overlay ───────────────── */}
      <section className="hero-section" style={{
        position: 'relative',
        height: '100vh',
        minHeight: 600,
        maxHeight: 900,
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        {/* Background image — inner relative wrapper required for next/image fill */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100%' }}>
            <Image
              src="/images/hero-community.jpeg"
              alt="Ethiopian community gathering"
              fill
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
              priority
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.75) 100%)',
            }}
          />
        </div>

        {/* Hero content */}
        <div className="container hero-content-mobile" style={{ position: 'relative', zIndex: 2, paddingBottom: 'clamp(40px, 10vw, 80px)', paddingTop: 'clamp(60px, 10vw, 120px)' }}>
          <div style={{ maxWidth: 720 }}>
            <p style={{
              fontSize: 'clamp(10px, 2vw, 12px)',
              fontWeight: 700,
              color: '#F9A825',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Calgary, Alberta · Est. 2012
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(42px, 6vw, 80px)',
              fontWeight: 700,
              lineHeight: 1.08,
              color: 'white',
              marginBottom: 28,
              letterSpacing: '-0.01em',
            }}>
              When one of us<br />
              grieves, we all<br />
              <em style={{ fontStyle: 'italic', color: '#F9A825' }}>stand together.</em>
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 4vw, 18px)',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.85)',
              marginBottom: 44,
              maxWidth: 540,
              fontWeight: 300,
            }}>
              The Samuel Bete Mutual Iddir is a community-based mutual aid organization
              rooted in Ethiopian tradition, providing financial and emotional support
              to members and their families during times of bereavement.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', flexDirection: 'column' }}>
              <a
                href="#apply"
                className="btn btn-v2-gold"
                style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 14 }}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("#apply");
                }}
              >
                Apply for Membership
                <span style={{ fontSize: 18 }} aria-hidden>→</span>
              </a>
              <a
                href="#about"
                className="btn btn-v2-outline-light"
                style={{ letterSpacing: '0.04em', fontSize: 14, fontWeight: 500 }}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("#about");
                }}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: 32,
          right: 40,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.3)' }} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ─── STATS BAND ─────────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-gray-900)',
        padding: '0',
      }}>
        <div className="container">
          <div className="stats-grid-mobile" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
          }}>
            {[
              { value: '2012', label: 'Year Founded', sub: 'In honour of Samuel Bete' },
              { value: 'Calgary', label: 'Based In', sub: 'Alberta, Canada' },
              { value: '100%', label: 'Member-Operated', sub: 'No outside administration' },
              { value: 'Iddir', label: 'Ethiopian Tradition', sub: 'Centuries of mutual aid' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: '36px 32px',
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#F9A825',
                  marginBottom: 6,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT IS AN IDDIR — Split screen ───────────────── */}
      <section id="about" style={{
        background: 'var(--color-off-white)',
      }}>
        <div className="split-grid-mobile" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 560,
        }}>
          {/* Image side */}
          <div style={{ position: 'relative', minHeight: 480 }}>
            <Image
              src="/images/community-gathering.jpeg"
              alt="Ethiopian community members gathered together"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(27,94,32,0.3) 0%, transparent 60%)',
            }} />
            {/* Floating label */}
            <div style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              background: 'var(--color-green)',
              color: 'white',
              padding: '12px 20px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              ኢዲር — Iddir
            </div>
          </div>

          {/* Text side */}
          <div style={{
            padding: 'clamp(48px, 6vw, 96px) clamp(40px, 5vw, 80px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-green)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              What is an Iddir?
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(30px, 3.5vw, 48px)',
              fontWeight: 700,
              color: 'var(--color-gray-900)',
              lineHeight: 1.15,
              marginBottom: 28,
              letterSpacing: '-0.01em',
            }}>
              A centuries-old tradition<br />of standing together
            </h2>
            <p style={{
              color: 'var(--color-gray-600)',
              lineHeight: 1.85,
              marginBottom: 20,
              fontSize: 16,
              fontWeight: 300,
            }}>
              An <strong style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>Iddir (ኢዲር)</strong> is a traditional Ethiopian community organization
              that pools resources to support members during times of loss. Rooted in centuries
              of Ethiopian culture, the Iddir embodies the principle that no family should face
              grief alone or bear its financial burden in isolation.
            </p>
            <p style={{
              color: 'var(--color-gray-600)',
              lineHeight: 1.85,
              marginBottom: 32,
              fontSize: 16,
              fontWeight: 300,
            }}>
              When a member or their immediate family experiences a death, the Iddir mobilizes
              to provide financial assistance for funeral expenses, practical coordination,
              and the emotional presence of community during the mourning period known as <em>lekso</em>.
            </p>
            <div style={{
              borderLeft: '3px solid #F9A825',
              paddingLeft: 20,
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontStyle: 'italic',
              color: 'var(--color-gray-700)',
              lineHeight: 1.6,
            }}>
              "In Ethiopia, no one grieves alone. The community is your family."
            </div>
          </div>
        </div>
      </section>

      {/* ─── SAMUEL BETE MEMORIAL ───────────────────────────────── */}
      <section id="memorial" style={{
        background: 'var(--color-gray-900)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(249,168,37,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(27,94,32,0.1) 0%, transparent 50%)',
        }} />

        <div className="split-grid-mobile" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Text side */}
          <div style={{
            padding: 'clamp(64px, 8vw, 112px) clamp(40px, 5vw, 80px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#F9A825',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              In Memoriam
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 4vw, 54px)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.12,
              marginBottom: 28,
              letterSpacing: '-0.01em',
            }}>
              Samuel Lulseged Bete<br />
              <span style={{ color: '#F9A825', fontSize: '0.65em', fontWeight: 400, fontStyle: 'italic' }}>
                September 6, 2000 — July 27, 2010
              </span>
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.85,
              marginBottom: 24,
              fontSize: 16,
              fontWeight: 300,
            }}>
              Samuel was nine years old — a bright, joyful child described by those who knew him
              as "always happy, healthy, joyous, agile, smart, and lovely." He was the only child
              of Whiwot and Leulsege Bete, an Ethiopian family who had made their home in Calgary
              after immigrating from Kenya in 2004.
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.85,
              marginBottom: 24,
              fontSize: 16,
              fontWeight: 300,
            }}>
              Samuel passed away on July 27, 2010 in a tragic accident. His loss was felt deeply
              across Calgary's Ethiopian community. In 2012, community members came together to
              incorporate the Samuel Bete Mutual Iddir — not just as a practical organization,
              but as a living act of remembrance.
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.85,
              fontSize: 16,
              fontWeight: 300,
            }}>
              Every contribution made, every family supported in their time of need, honours
              Samuel's memory and ensures that no family in our community faces loss alone.
            </p>
          </div>

          {/* Image side */}
          <div className="memorial-image-hide" style={{ position: 'relative', minHeight: 500 }}>
            <Image
              src="/images/candlelight-vigil.jpg"
              alt="Community candlelight vigil in memory"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(17,24,39,0.6) 0%, rgba(17,24,39,0.1) 50%, transparent 100%)',
            }} />
            {/* Memorial plaque */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              padding: '28px 36px',
              border: '1px solid rgba(249,168,37,0.4)',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              minWidth: 240,
            }}>
              <div style={{ fontSize: 11, color: '#F9A825', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                In Loving Memory
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'white', fontWeight: 600, marginBottom: 8 }}>
                Samuel Bete
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                2000 – 2010
              </div>
              <div style={{ width: 40, height: 1, background: '#F9A825', margin: '0 auto' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ───────────────────────────────────────────── */}
      <section id="benefits" style={{ background: 'white', padding: 'clamp(64px, 8vw, 112px) 0' }}>
        <div className="container">
          {/* Section header */}
          <div style={{ maxWidth: 560, marginBottom: 64 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-green)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Membership Benefits
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(30px, 4vw, 48px)',
              fontWeight: 700,
              color: 'var(--color-gray-900)',
              lineHeight: 1.15,
              marginBottom: 20,
              letterSpacing: '-0.01em',
            }}>
              What your membership provides
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-gray-500)', lineHeight: 1.75, fontWeight: 300 }}>
              A small monthly contribution ensures that when the unthinkable happens,
              your family will not face it alone — financially or emotionally.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="benefits-grid-mobile" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            background: 'var(--color-gray-100)',
          }}>
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                ),
                title: 'Funeral Financial Assistance',
                body: 'A significant payout to help cover funeral home services, burial costs, and related expenses when a member or their immediate family passes away.',
                accent: '#F9A825',
                iconColor: '#92650A',
                bg: '#FFF8E1',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    <path d="M14.05 2a9 9 0 0 1 8 7.94M14.05 6A5 5 0 0 1 18 10"/>
                  </svg>
                ),
                title: 'Repatriation Support',
                body: 'Assistance with the costs of transporting remains to Ethiopia for burial, honouring the deeply held tradition of returning home.',
                accent: '#F9A825',
                iconColor: '#92650A',
                bg: '#FFF8E1',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="4" rx="1" ry="1"/>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="9" y1="16" x2="13" y2="16"/>
                    <polyline points="9 9 10 10 12 8"/>
                  </svg>
                ),
                title: 'Lekso Coordination',
                body: 'Practical support during the mourning period — coordinating food, seating, and logistics so the family can focus on grieving together.',
                accent: '#F9A825',
                iconColor: '#92650A',
                bg: '#FFF8E1',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: 'Family Coverage',
                body: 'Benefits extend to your registered spouse and dependent children, ensuring your entire household is protected under a single membership.',
                accent: '#F9A825',
                iconColor: '#92650A',
                bg: '#FFF8E1',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                ),
                title: 'Community Presence',
                body: 'Members show up. During lekso, Iddir members serve as pallbearers, distribute food, and provide the moral support of a community that cares.',
                accent: '#F9A825',
                iconColor: '#92650A',
                bg: '#FFF8E1',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                ),
                title: 'Transparent Governance',
                body: 'A formal by-laws structure, elected officers, and a member portal for full transparency on contributions, balances, and organization decisions.',
                accent: '#F9A825',
                iconColor: '#92650A',
                bg: '#FFF8E1',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                style={{
                  background: 'white',
                  padding: '40px 36px',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  background: benefit.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                  color: benefit.iconColor,
                }}>
                  {benefit.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--color-gray-900)',
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}>
                  {benefit.title}
                </h3>
                <p style={{
                  fontSize: 15,
                  color: 'var(--color-gray-500)',
                  lineHeight: 1.75,
                  fontWeight: 300,
                }}>
                  {benefit.body}
                </p>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: 3,
                  background: benefit.accent,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PHOTO BAND — Full-width community photo ────────────── */}
      <section style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <Image
          src="/images/ethiopian-festival.jpeg"
          alt="Ethiopian community celebration"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(27,94,32,0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 720, padding: '0 24px' }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(24px, 4vw, 44px)',
              fontWeight: 600,
              color: 'white',
              lineHeight: 1.35,
              fontStyle: 'italic',
              marginBottom: 24,
            }}>
              "The Iddir is not just insurance. It is the community saying:<br />
              <em style={{ color: '#F9A825' }}>we see you, we are here, you are not alone.</em>"
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              — Ethiopian Mutual Aid Tradition
            </p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────── */}
      <section style={{ background: 'var(--color-off-white)', padding: 'clamp(64px, 8vw, 112px) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-green)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              How It Works
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 700,
              color: 'var(--color-gray-900)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}>
              Simple, transparent, and community-run
            </h2>
          </div>

          <div className="how-it-works-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            position: 'relative',
          }}>
            {/* Connector line */}
            <div className="connector-line" style={{
              position: 'absolute',
              top: 32,
              left: '12.5%',
              right: '12.5%',
              height: 1,
              background: 'var(--color-gray-200)',
              zIndex: 0,
            }} />

            {[
              { step: '01', title: 'Apply', body: 'Submit your membership application online. Our admin team reviews and approves new members.' },
              { step: '02', title: 'Contribute', body: 'Pay a small monthly contribution. Track your balance and payment history in your member portal.' },
              { step: '03', title: 'Register Family', body: 'Add your spouse and dependent children to ensure they are covered under your membership.' },
              { step: '04', title: 'Be Supported', body: 'When a loss occurs, submit a request. The Iddir responds with financial assistance and community support.' },
            ].map((item) => (
              <div key={item.step} style={{ padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  background: 'var(--color-green)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 22,
                  fontWeight: 700,
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--color-gray-900)',
                  marginBottom: 12,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: 'var(--color-gray-500)',
                  lineHeight: 1.75,
                  fontWeight: 300,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── APPLICATION FORM ───────────────────────────────────── */}
      <section id="apply" style={{ background: 'white' }}>
        <div className="application-form-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 600,
        }}>
          {/* Left — Image + info */}
          <div style={{ position: 'relative', background: 'var(--color-gray-900)', overflow: 'hidden', minHeight: 400 }}>
            <Image
              src="/images/hands-together.jpg"
              alt="Community hands together"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.4 }}
            />
            <div style={{
              position: 'relative',
              zIndex: 1,
              padding: 'clamp(48px, 6vw, 80px) clamp(40px, 5vw, 72px)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <p style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#F9A825',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                Membership Application
              </p>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.2,
                marginBottom: 28,
                letterSpacing: '-0.01em',
              }}>
                Join the Samuel Bete<br />Mutual Iddir
              </h2>
              <p style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
                marginBottom: 40,
                fontWeight: 300,
              }}>
                Membership is open to all Ethiopians and their families living in Canada.
                Once your application is reviewed and approved by our admin team,
                you will receive login credentials to access the member portal.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { icon: '✓', text: 'Monthly contributions from $30' },
                  { icon: '✓', text: 'Coverage for spouse and dependent children' },
                  { icon: '✓', text: 'Financial assistance upon bereavement' },
                  { icon: '✓', text: 'Full member portal access' },
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      background: 'rgba(249,168,37,0.15)',
                      border: '1px solid rgba(249,168,37,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F9A825',
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: 300 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                  Already a member?{' '}
                  <Link href="/login" style={{ color: '#F9A825', textDecoration: 'none', fontWeight: 600 }}>
                    Sign in to your account →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div style={{
            padding: 'clamp(48px, 6vw, 80px) clamp(40px, 5vw, 72px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 72,
                  height: 72,
                  background: 'var(--color-green-pale)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: 32,
                }}>
                  ✓
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--color-gray-900)',
                  marginBottom: 16,
                }}>
                  Application Received
                </h3>
                <p style={{ fontSize: 16, color: 'var(--color-gray-500)', lineHeight: 1.75, fontWeight: 300 }}>
                  Thank you for applying to join the Samuel Bete Mutual Iddir.
                  Our admin team will review your application and contact you
                  at the email address you provided.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--color-gray-900)',
                  marginBottom: 8,
                }}>
                  Apply for Membership
                </h3>
                <p style={{ fontSize: 14, color: 'var(--color-gray-400)', marginBottom: 32, fontWeight: 300 }}>
                  All fields marked with * are required.
                </p>

                {submitError && (
                  <div className="alert-error" style={{ marginBottom: 24 }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label" htmlFor="firstName">
                      First Name <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className={`form-input${errors.firstName ? ' error' : ''}`}
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                    />
                    {errors.firstName && <p className="error-message">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="lastName">
                      Last Name <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className={`form-input${errors.lastName ? ' error' : ''}`}
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                    />
                    {errors.lastName && <p className="error-message">{errors.lastName}</p>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label" htmlFor="email">
                      Email Address <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-input${errors.email ? ' error' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="phone">
                      Phone Number <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={`form-input${errors.phone ? ' error' : ''}`}
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                    />
                    {errors.phone && <p className="error-message">{errors.phone}</p>}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="address">
                    Street Address <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className={`form-input${errors.address ? ' error' : ''}`}
                    value={formData.address}
                    onChange={handleChange}
                    autoComplete="street-address"
                  />
                  {errors.address && <p className="error-message">{errors.address}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label" htmlFor="city">
                      City <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className={`form-input${errors.city ? ' error' : ''}`}
                      value={formData.city}
                      onChange={handleChange}
                      autoComplete="address-level2"
                    />
                    {errors.city && <p className="error-message">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="province">
                      Province <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <select
                      id="province"
                      name="province"
                      className={`form-input${errors.province ? ' error' : ''}`}
                      value={formData.province}
                      onChange={handleChange}
                    >
                      <option value="">—</option>
                      {['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.province && <p className="error-message">{errors.province}</p>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="postalCode">
                      Postal Code <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      className={`form-input${errors.postalCode ? ' error' : ''}`}
                      value={formData.postalCode}
                      onChange={handleChange}
                      autoComplete="postal-code"
                    />
                    {errors.postalCode && <p className="error-message">{errors.postalCode}</p>}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="household_size">
                    Family composition <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <input
                    id="household_size"
                    name="household_size"
                    type="text"
                    className={`form-input${errors.household_size ? ' error' : ''}`}
                    value={formData.household_size}
                    onChange={handleChange}
                    placeholder="e.g. 2 adults, 2 children"
                  />
                  {errors.household_size && <p className="error-message">{errors.household_size}</p>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="proposed_category">
                    Proposed membership category <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <select
                    id="proposed_category"
                    name="proposed_category"
                    className="form-input"
                    value={formData.proposed_category}
                    onChange={handleChange}
                  >
                    {MEMBERSHIP_CATEGORY_OPTIONS.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label className="form-label" htmlFor="message">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className="form-input"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself or any questions you have..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-v2-submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{
        background: 'var(--color-gray-900)',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <div className="flag-bar">
          <div />
        </div>
        <div className="container" style={{ padding: '64px 24px 32px' }}>
          <div className="footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 56,
            paddingBottom: 56,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  background: 'var(--color-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 12, letterSpacing: '0.06em' }}>SBMI</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'white', lineHeight: 1.2 }}>
                    Samuel Bete Mutual Iddir
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Calgary, Alberta
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 300, fontWeight: 300 }}>
                A community mutual aid organization rooted in Ethiopian tradition,
                serving members and their families across Canada since 2012.
              </p>
            </div>

            {/* Organization */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
                Organization
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { href: '#about', label: 'About the Iddir' },
                  { href: '#memorial', label: 'Samuel\'s Story' },
                  { href: '#benefits', label: 'Member Benefits' },
                  { href: '#apply', label: 'Apply for Membership' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, fontWeight: 300 }}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Members */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
                Members
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { href: '/login', label: 'Member Login' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, fontWeight: 300 }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
                Contact
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 12, fontWeight: 300 }}>
                For membership inquiries or general questions:
              </p>
              <a
                href="mailto:info@sbmi.ca"
                style={{ color: '#F9A825', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}
              >
                info@sbmi.ca
              </a>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16, lineHeight: 1.6, fontWeight: 300 }}>
                Calgary, Alberta<br />Canada
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <p style={{ fontSize: 13, fontWeight: 300 }}>
              &copy; {new Date().getFullYear()} Samuel Bete Mutual Iddir. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link href="/login" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 13 }}>
                Member Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── RESPONSIVE STYLES ──────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; flex-direction: column; }
        }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr 1fr !important;
          }
          footer .container > div[style*="grid-template-columns: 2fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          section > div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
          footer .container > div[style*="grid-template-columns: 2fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        .home-v2-root a:hover { opacity: 0.92; }
      `}</style>
    </div>
  )
}

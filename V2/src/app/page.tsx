'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface ApplicationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  message: string
}

interface FormErrors {
  [key: string]: string
}

export default function WelcomePage() {
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const validate = (): FormErrors => {
    const errs: FormErrors = {}
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.'
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.'
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.'
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.'
    if (!formData.address.trim()) errs.address = 'Address is required.'
    if (!formData.city.trim()) errs.city = 'City is required.'
    if (!formData.province.trim()) errs.province = 'Province is required.'
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal code is required.'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setSubmitError(data.error || 'Submission failed. Please try again.')
      }
    } catch {
      setSubmitError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  return (
    <div style={{ background: 'white' }}>
      <style>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .flag-bar { height: 4px; background: linear-gradient(90deg, #1B5E20 0%, #F9A825 50%, #C62828 100%); }
        
        @media (max-width: 768px) {
          .container { padding: 0 16px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .split-screen { grid-template-columns: 1fr !important; }
          .split-screen-image { min-height: 300px !important; }
          .split-screen-text { padding: 32px 16px !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
          .quote-band { padding: 40px 16px !important; }
          .how-it-works { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── STICKY HEADER ────────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'white' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--color-gray-200)' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div className="flag-bar" />
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--color-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 14,
            }}>SB</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-gray-900)', lineHeight: 1.1 }}>
                Samuel Bete
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-gray-500)', letterSpacing: '0.04em' }}>
                Mutual Iddir
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link href="/login" style={{
              textDecoration: 'none',
              color: 'var(--color-green)',
              fontWeight: 600,
              fontSize: 14,
            }}>
              Member Login
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section style={{
        height: 'clamp(400px, 100vh, 600px)',
        background: `url(/images/hero-community.jpeg) center/cover no-repeat`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(27,94,32,0.5) 0%, rgba(198,40,40,0.3) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, padding: '0 20px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 8vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 16,
          }}>
            When one of us grieves, we all <span style={{ color: '#F9A825' }}>stand together.</span>
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 4vw, 18px)',
            fontWeight: 400,
            lineHeight: 1.6,
            marginBottom: 32,
            opacity: 0.95,
          }}>
            Calgary, Alberta · Est. 2012
          </p>
          <Link href="#apply" style={{
            display: 'inline-block',
            background: '#F9A825',
            color: 'var(--color-gray-900)',
            padding: 'clamp(12px, 2vw, 16px) clamp(24px, 5vw, 40px)',
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 'clamp(13px, 2vw, 16px)',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }} onMouseEnter={(e) => { e.currentTarget.style.background = '#E89500'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#F9A825'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Join Our Community
          </Link>
        </div>
      </section>

      {/* ─── STATS BAND ────────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-gray-900)',
        padding: '0',
      }}>
        <div className="container">
          <div className="stats-grid" style={{
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
                  padding: 'clamp(20px, 5vw, 36px) clamp(16px, 4vw, 32px)',
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(24px, 6vw, 32px)',
                  fontWeight: 700,
                  color: '#F9A825',
                  marginBottom: 6,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 'clamp(12px, 2vw, 13px)', fontWeight: 600, color: 'white', marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: 'rgba(255,255,255,0.4)' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT IS AN IDDIR — Split screen ────────────────────── */}
      <section id="about" style={{ background: 'var(--color-off-white)' }}>
        <div className="split-screen" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 560,
        }}>
          {/* Image side */}
          <div className="split-screen-image" style={{ position: 'relative', minHeight: 480 }}>
            <Image
              src="/images/community-gathering.jpeg"
              alt="Ethiopian community members gathered together"
              fill
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
              bottom: 'clamp(16px, 4vw, 32px)',
              left: 'clamp(16px, 4vw, 32px)',
              background: 'var(--color-green)',
              color: 'white',
              padding: '12px 20px',
              fontSize: 'clamp(11px, 2vw, 12px)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              ኢዲር — Iddir
            </div>
          </div>

          {/* Text side */}
          <div className="split-screen-text" style={{
            padding: 'clamp(32px, 6vw, 96px) clamp(24px, 5vw, 80px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-green)', marginBottom: 16 }}>
              WHAT IS AN IDDIR?
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 6vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'var(--color-gray-900)',
              marginBottom: 24,
            }}>
              A centuries-old tradition of standing together
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.7,
              color: 'var(--color-gray-600)',
              marginBottom: 20,
            }}>
              An <strong>Iddir</strong> (ኢዲር) is a traditional Ethiopian community organization that pools resources to support members during times of bereavement and hardship. For centuries, Ethiopians have relied on this mutual aid system to ensure no one faces adversity alone.
            </p>
            <blockquote style={{
              borderLeft: '4px solid #F9A825',
              paddingLeft: 20,
              fontStyle: 'italic',
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--color-gray-700)',
              margin: '20px 0',
            }}>
              "By pooling our resources and standing together, we can face any adversity." — Samuel Bete Mutual Iddir
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─── SAMUEL BETE MEMORIAL ────────────────────────────────── */}
      <section style={{
        background: 'var(--color-gray-900)',
        color: 'white',
      }}>
        <div className="split-screen" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 480,
        }}>
          {/* Text side */}
          <div className="split-screen-text" style={{
            padding: 'clamp(32px, 6vw, 96px) clamp(24px, 5vw, 80px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#F9A825', marginBottom: 16 }}>
              IN MEMORY
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 6vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 24,
            }}>
              Samuel Lulseged Bete
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.7,
              marginBottom: 16,
              opacity: 0.9,
            }}>
              September 6, 2000 – July 27, 2010
            </p>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.7,
              marginBottom: 20,
              opacity: 0.85,
            }}>
              Samuel was a beloved 9-year-old member of the Ethiopian community in Calgary. Known for his joyful spirit, kindness, and bright smile, he embodied the values of community and togetherness. His parents, Whiwot and Leulsege Bete, immigrated from Ethiopia to Canada in 2004 to build a better life for their family.
            </p>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.7,
              opacity: 0.85,
            }}>
              In 2012, two years after Samuel's passing, community members established the Samuel Bete Memorial Iddir in his honor. Every contribution made by our members, every family supported in their time of need, is a living testament to Samuel's legacy and the enduring strength of our community.
            </p>
          </div>

          {/* Image side */}
          <div className="split-screen-image" style={{ position: 'relative', minHeight: 480 }}>
            <Image
              src="/images/candlelight-vigil.jpeg"
              alt="Candlelight vigil in memory of Samuel Bete"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center',
              padding: 20,
            }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 700,
                lineHeight: 1.3,
              }}>
                Forever in our hearts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS GRID ────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-gray-50)', padding: 'clamp(48px, 8vw, 96px) 0' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'clamp(32px, 5vw, 64px)',
            color: 'var(--color-gray-900)',
          }}>
            What We Offer
          </h2>

          <div className="benefits-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(20px, 4vw, 32px)',
          }}>
            {[
              {
                title: 'Funeral Financial Assistance',
                desc: 'A significant payout to help cover funeral home services, burial costs, and related expenses when a member or their immediate family passes away.',
                icon: (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-green)">
                    <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm-2 15l-5-5 1.41-1.41L10 13.17l7.59-7.59L19 7l-9 9z"/>
                  </svg>
                ),
                bg: 'var(--color-green-pale)',
              },
              {
                title: 'Repatriation Support',
                desc: 'Assistance with the costs of transporting remains to Ethiopia for burial, honouring the deeply held tradition of returning home.',
                icon: (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-green)">
                    <path d="M10.5 1.5H3.75A2.25 2.25 0 0 0 1.5 3.75v16.5A2.25 2.25 0 0 0 3.75 22.5h16.5a2.25 2.25 0 0 0 2.25-2.25V13.5M23 1.5 12.75 11.75M23 1.5v6.75M23 1.5h-6.75"/>
                  </svg>
                ),
                bg: 'var(--color-green-pale)',
              },
              {
                title: 'Lekso Coordination',
                desc: 'Practical support during the mourning period — coordinating food, seating, and logistics so the family can focus on grieving together.',
                icon: (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-green)">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                ),
                bg: 'var(--color-green-pale)',
              },
              {
                title: 'Family Coverage',
                desc: 'Benefits extend to your registered spouse and dependent children, ensuring your entire household is protected under a single membership.',
                icon: (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-gold)">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                ),
                bg: 'var(--color-gold-pale)',
              },
              {
                title: 'Community Presence',
                desc: 'Members show up. During lekso, Iddir members serve as pallbearers, distribute food, and provide the moral support of a community that cares.',
                icon: (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-gold)">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                ),
                bg: 'var(--color-gold-pale)',
              },
              {
                title: 'Transparent Governance',
                desc: 'A formal by-laws structure, elected officers, and a member portal for full transparency on contributions, balances, and organization decisions.',
                icon: (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-gold)">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                ),
                bg: 'var(--color-gold-pale)',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                style={{
                  background: 'white',
                  padding: 'clamp(24px, 4vw, 32px)',
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  background: benefit.bg,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {benefit.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(16px, 3vw, 18px)',
                  fontWeight: 700,
                  color: 'var(--color-gray-900)',
                  marginBottom: 12,
                }}>
                  {benefit.title}
                </h3>
                <p style={{
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  lineHeight: 1.6,
                  color: 'var(--color-gray-600)',
                }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUOTE BAND ────────────────────────────────────────── */}
      <section className="quote-band" style={{
        background: `url(/images/ethiopian-festival.jpeg) center/cover no-repeat`,
        padding: 'clamp(40px, 10vw, 120px) 20px',
        position: 'relative',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(27,94,32,0.6) 0%, rgba(27,94,32,0.4) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <blockquote style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(24px, 6vw, 42px)',
            fontWeight: 700,
            lineHeight: 1.3,
            fontStyle: 'italic',
            margin: 0,
          }}>
            "Together, we honor the past, support the present, and build a stronger future for our community."
          </blockquote>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: 'clamp(48px, 8vw, 96px) 0' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'clamp(32px, 5vw, 64px)',
            color: 'var(--color-gray-900)',
          }}>
            How It Works
          </h2>

          <div className="how-it-works" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(20px, 4vw, 40px)',
            position: 'relative',
          }}>
            {[
              { num: '01', title: 'Apply', desc: 'Submit your membership application with basic information about yourself and your family.' },
              { num: '02', title: 'Contribute', desc: 'Make a monthly contribution to the mutual aid fund. Your membership covers your entire household.' },
              { num: '03', title: 'Community', desc: 'Participate in lekso ceremonies and community events. Your presence strengthens our bonds.' },
              { num: '04', title: 'Support', desc: 'When hardship strikes, the Iddir is there. Financial assistance and community support await.' },
            ].map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(32px, 6vw, 48px)',
                  fontWeight: 700,
                  color: '#F9A825',
                  marginBottom: 12,
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(16px, 3vw, 18px)',
                  fontWeight: 700,
                  color: 'var(--color-gray-900)',
                  marginBottom: 8,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  lineHeight: 1.6,
                  color: 'var(--color-gray-600)',
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── APPLICATION FORM ────────────────────────────────────── */}
      <section id="apply" style={{ background: 'var(--color-gray-50)', padding: 'clamp(48px, 8vw, 96px) 0' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'clamp(32px, 5vw, 64px)',
            color: 'var(--color-gray-900)',
          }}>
            Join the Samuel Bete Mutual Iddir
          </h2>

          {submitted ? (
            <div style={{
              maxWidth: 600,
              margin: '0 auto',
              background: 'white',
              padding: 'clamp(32px, 5vw, 48px)',
              borderRadius: 8,
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 700,
                color: 'var(--color-gray-900)',
                marginBottom: 12,
              }}>
                Application Received
              </h3>
              <p style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--color-gray-600)',
                lineHeight: 1.6,
              }}>
                Thank you for your interest in joining the Samuel Bete Mutual Iddir. Your application has been received and will be reviewed by our administration team. We will contact you within 5 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              maxWidth: 700,
              margin: '0 auto',
              background: 'white',
              padding: 'clamp(32px, 5vw, 48px)',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              {submitError && (
                <div style={{
                  background: '#FEE',
                  color: '#C62828',
                  padding: 12,
                  borderRadius: 4,
                  marginBottom: 20,
                  fontSize: 14,
                }}>
                  {submitError}
                </div>
              )}

              <div className="form-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(16px, 3vw, 24px)',
                marginBottom: 'clamp(16px, 3vw, 24px)',
              }}>
                {[
                  { name: 'firstName', label: 'First Name *', type: 'text' },
                  { name: 'lastName', label: 'Last Name *', type: 'text' },
                  { name: 'email', label: 'Email *', type: 'email' },
                  { name: 'phone', label: 'Phone *', type: 'tel' },
                  { name: 'address', label: 'Address *', type: 'text', fullWidth: true },
                  { name: 'city', label: 'City *', type: 'text' },
                  { name: 'province', label: 'Province *', type: 'text' },
                  { name: 'postalCode', label: 'Postal Code *', type: 'text' },
                ].map((field) => (
                  <div key={field.name} style={{
                    gridColumn: field.fullWidth ? '1 / -1' : 'auto',
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: 'clamp(12px, 2vw, 14px)',
                      fontWeight: 600,
                      marginBottom: 6,
                      color: 'var(--color-gray-700)',
                    }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof ApplicationFormData]}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: errors[field.name] ? '1px solid #C62828' : '1px solid var(--color-gray-300)',
                        borderRadius: 4,
                        fontSize: 16,
                        fontFamily: 'var(--font-sans)',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors[field.name] && (
                      <div style={{ fontSize: 12, color: '#C62828', marginTop: 4 }}>
                        {errors[field.name]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  fontWeight: 600,
                  marginBottom: 6,
                  color: 'var(--color-gray-700)',
                }}>
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 4,
                    fontSize: 16,
                    fontFamily: 'var(--font-sans)',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 2vw, 16px)',
                  background: submitting ? 'var(--color-gray-400)' : 'var(--color-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.background = '#0D4620'
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.currentTarget.style.background = 'var(--color-green)'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--color-gray-900)', color: 'white', padding: 'clamp(32px, 5vw, 64px) 0' }}>
        <div className="flag-bar" />
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(32px, 5vw, 48px)',
            marginBottom: 'clamp(32px, 5vw, 48px)',
          }}>
            <div>
              <h4 style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, color: '#F9A825' }}>
                Organization
              </h4>
              <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.8, opacity: 0.8 }}>
                Samuel Bete Mutual Iddir<br />
                Calgary, Alberta<br />
                Canada
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, color: '#F9A825' }}>
                Members
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li><Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.8 }}>Member Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, color: '#F9A825' }}>
                Contact
              </h4>
              <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.8, opacity: 0.8 }}>
                <a href="mailto:info@sbmi.ca" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  info@sbmi.ca
                </a>
              </p>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 'clamp(16px, 3vw, 24px)',
            textAlign: 'center',
            fontSize: 'clamp(12px, 2vw, 13px)',
            opacity: 0.6,
          }}>
            © {new Date().getFullYear()} Samuel Bete Mutual Iddir. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

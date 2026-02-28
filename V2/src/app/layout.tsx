import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  // Next.js injects this as --font-playfair-display on <html>
  variable: '--font-playfair-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  // Next.js injects this as --font-inter on <html>
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Samuel Bete Mutual Iddir — SBMI',
  description:
    'A community mutual aid organization rooted in Ethiopian tradition, serving members and their families in Canada.',
  keywords: [
    'Ethiopian community',
    'mutual aid',
    'Iddir',
    'Calgary',
    'Edmonton',
    'Alberta',
    'bereavement support',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}

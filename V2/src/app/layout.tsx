import type { Metadata } from 'next'
import { Libre_Baskerville, Source_Sans_3 } from 'next/font/google'
import './globals.css'

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  // Next.js injects this as --font-libre-baskerville on <html>
  variable: '--font-libre-baskerville',
  display: 'swap',
})

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  // Next.js injects this as --font-source-sans-3 on <html>
  variable: '--font-source-sans-3',
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
    <html lang="en" className={`${libreBaskerville.variable} ${sourceSans3.variable}`}>
      <body>{children}</body>
    </html>
  )
}

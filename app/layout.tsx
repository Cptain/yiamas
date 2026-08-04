import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Manrope, Alegreya } from 'next/font/google'
import './globals.css'
import '../styles/main.scss'

const manrope = Manrope({
  subsets: ['latin', 'greek'],
  variable: '--font-body',
  display: 'swap',
})

const alegreya = Alegreya({
  subsets: ['latin', 'greek'],
  variable: '--font-accent',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Yiamas.live — Γεια μας! Ζωντανά Ελληνικά Πανηγύρια',
  description:
    'Το Yiamas.live μεταδίδει ζωντανά ελληνικά πανηγύρια. Παρακολούθησε τη μουσική και τον χορό, μίλα με το πλήθος και στείλε δωράκια σε χρήματα, φαγητό και ποτό. Yiamas!',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#141a26',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="el"
      className={`${manrope.variable} ${alegreya.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

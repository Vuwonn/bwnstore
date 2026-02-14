import "./globals.css"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Gaming Shop Np - Free Fire Diamond & PUBG UC Top Up in Nepal',
    template: '%s | Gaming Shop Np',
  },
  description:
    'Top up Free Fire diamonds and PUBG UC in Nepal with fast delivery. Pay securely from eSewa and track your order status online.',
  keywords: [
    'top up free fire diamond',
    'free fire diamond top up nepal',
    'pubg uc top up',
    'pubg uc nepal',
    'gaming top up nepal',
    'top up from esewa',
    'esewa gaming top up',
    'how to top up diamond uc in nepal',
    'buy free fire diamond',
    'buy pubg uc',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Gaming Shop Np - Free Fire Diamond & PUBG UC Top Up in Nepal',
    description:
      'Top up Free Fire diamonds and PUBG UC in Nepal with fast delivery and secure eSewa payment.',
    type: 'website',
    locale: 'en_NP',
    siteName: 'Gaming Shop Np',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaming Shop Np - Free Fire Diamond & PUBG UC Top Up in Nepal',
    description:
      'Top up Free Fire diamonds and PUBG UC in Nepal with secure eSewa payment and fast delivery.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
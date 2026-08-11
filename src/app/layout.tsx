import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://effortlessinsight.in'),
  title: 'EffortlessInsight - GST Notice Management',
  description: 'AI-powered GST Notice Operating System for Indian businesses',
  manifest: '/manifest.json',
  icons: {
    icon: '/small-logo.svg',
    apple: '/small-logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EffortlessInsight',
  },
}

// No maximumScale: pinch-zoom must stay available for low-vision users
export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

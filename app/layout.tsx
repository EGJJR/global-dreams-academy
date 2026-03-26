import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Global Dreams Academy - Youth Basketball Development',
  description: 'A youth basketball development league and training program focused on skill development, leadership growth, and community engagement.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased overflow-x-hidden min-h-[100dvh]">{children}</body>
    </html>
  )
}

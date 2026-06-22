import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/ui/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BMC — Biomedical Campus',
  description: 'AI-powered building management system for Biomedical Campus BSD City — Digital Hub SEZ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

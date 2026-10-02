import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PwaRegister } from '@/components/PwaRegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ReportWise',
  description: 'Guided Report Writing',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#1F3A5F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}

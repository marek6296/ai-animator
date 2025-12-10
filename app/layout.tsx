import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ToasterProvider from '@/components/ToasterProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Animator - Personalizované komiksy a animácie',
  description: 'Vytvárajte personalizované komiksy, animácie a meme packy pomocou AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <body className={inter.className}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}


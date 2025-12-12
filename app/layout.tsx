import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ToasterProvider from '@/components/ToasterProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Easy Places - Plánovač výletov po Európe',
  description: 'Inteligentný plánovač výletov po Európe. Získajte personalizované tipy na destinácie, aktivity a miesta na návštevu.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
          <ToasterProvider />
        </LanguageProvider>
      </body>
    </html>
  )
}


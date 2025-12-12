'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage, getLanguageName } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages: Array<{ code: 'sk' | 'en' | 'no'; name: string; flag: string }> = [
    { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  ]

  // Zatvor dropdown pri kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 glass border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-all"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <Globe className="w-4 h-4" />
        <span className="text-base">{languages.find(l => l.code === selectedLanguage)?.flag}</span>
        <span className="hidden md:inline text-sm">{getLanguageName(selectedLanguage)}</span>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 z-50 glass rounded-lg border border-cyan-500/30 p-1.5 min-w-[140px]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-md transition-all flex items-center gap-2 text-sm ${
                selectedLanguage === lang.code
                  ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                  : 'text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

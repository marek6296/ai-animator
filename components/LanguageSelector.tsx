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
        className="flex items-center gap-1 px-1.5 py-0.5 glass border border-cyan-500/30 rounded text-cyan-400 text-xs font-medium hover:bg-cyan-400/10 transition-all"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <Globe className="w-3 h-3" />
        <span className="text-sm">{languages.find(l => l.code === selectedLanguage)?.flag}</span>
        <span className="hidden md:inline text-xs">{getLanguageName(selectedLanguage)}</span>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-1 z-50 glass rounded border border-cyan-500/30 p-1 min-w-[120px]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full text-left px-2 py-1 rounded transition-all flex items-center gap-1.5 text-xs ${
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

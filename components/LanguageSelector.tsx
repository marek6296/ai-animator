'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage, getLanguageName } = useLanguage()

  const languages: Array<{ code: 'sk' | 'en' | 'no'; name: string; flag: string }> = [
    { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  ]

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-4 py-2 glass border border-cyan-500/30 rounded-lg text-cyan-400 font-semibold hover:bg-cyan-400/10 transition-all"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <Globe className="w-5 h-5" />
        <span>{languages.find(l => l.code === selectedLanguage)?.flag}</span>
        <span className="hidden md:inline">{getLanguageName(selectedLanguage)}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg border border-cyan-500/30 p-2 min-w-[150px]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
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
      </div>
    </div>
  )
}


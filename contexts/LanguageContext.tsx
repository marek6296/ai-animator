'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getTranslations, type Translations } from '@/lib/translations'

export type Language = 'sk' | 'en' | 'no'

interface LanguageContextType {
  selectedLanguage: Language
  setSelectedLanguage: (lang: Language) => void
  getLanguageName: (lang: Language) => string
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_NAMES: Record<Language, string> = {
  sk: 'Slovenčina',
  en: 'English',
  no: 'Norsk',
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language>('sk')

  // Načítaj jazyk z localStorage pri načítaní
  useEffect(() => {
    const saved = localStorage.getItem('selectedLanguage') as Language | null
    if (saved && ['sk', 'en', 'no'].includes(saved)) {
      setSelectedLanguageState(saved)
    }
  }, [])

  // Ulož jazyk do localStorage pri zmene
  const setSelectedLanguage = (lang: Language) => {
    setSelectedLanguageState(lang)
    localStorage.setItem('selectedLanguage', lang)
  }

  const getLanguageName = (lang: Language) => LANGUAGE_NAMES[lang]

  const translations = getTranslations(selectedLanguage)

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        getLanguageName,
        t: translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}


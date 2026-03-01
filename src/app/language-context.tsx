import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const [language, setLanguageState] = useState(i18n.language)

  // Load language from localStorage on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem('app-language') || 'en'
    i18n.changeLanguage(storedLanguage)
    setLanguageState(storedLanguage)
  }, [i18n])

  const setLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang)
    localStorage.setItem('app-language', lang)
    setLanguageState(lang)
    // Apply RTL for Tamil
    if (lang === 'ta') {
      document.documentElement.setAttribute('dir', 'rtl')
    } else {
      document.documentElement.setAttribute('dir', 'ltr')
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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

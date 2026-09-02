import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import en from "@/i18n/translations/en.json"
import id from "@/i18n/translations/id.json"

export type Locale = "en" | "id"

const translations = { en, id } as const

type Translations = typeof en

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: Translations
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = "locale"

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "en" || stored === "id") return stored
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith("id")) return "id"
  return "en"
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "id" : "en")
  }, [locale, setLocale])

  const value: I18nContextValue = {
    locale,
    setLocale,
    toggleLocale,
    t: translations[locale],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

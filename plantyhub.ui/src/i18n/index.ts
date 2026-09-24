import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import bg from './locales/bg.json'
import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { defaultLanguage, localeFromPathname, preferredLanguage } from './languages'

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const saved = preferredLanguage()
const initialLanguage = localeFromPathname(window.location.pathname, basePath) ?? saved ?? defaultLanguage

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bg: { translation: bg },
    de: { translation: de },
    fr: { translation: fr },
  },
  lng: initialLanguage,
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
})

document.documentElement.lang = initialLanguage

export default i18n

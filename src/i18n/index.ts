import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import bg from './locales/bg.json'
import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { defaultLanguage, languageStorageKey, type LanguageCode } from './languages'

const saved = localStorage.getItem(languageStorageKey) as LanguageCode | null
const initialLanguage = saved ?? defaultLanguage

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

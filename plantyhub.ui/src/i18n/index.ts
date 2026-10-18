import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import bg from './locales/bg.json'
import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { defaultLanguage, isActiveLanguage, localeFromPathname, preferredLanguage } from './languages'

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const fromPath = localeFromPathname(window.location.pathname, basePath)
const rest = basePath && (window.location.pathname === basePath || window.location.pathname.startsWith(`${basePath}/`))
  ? window.location.pathname.slice(basePath.length)
  : window.location.pathname
const onAdmin = rest === '/admin' || rest.startsWith('/admin/')
const initialLanguage = fromPath && isActiveLanguage(fromPath)
  ? fromPath
  : onAdmin
    ? preferredLanguage()
    : defaultLanguage

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

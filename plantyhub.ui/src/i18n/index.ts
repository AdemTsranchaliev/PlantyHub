import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import bg from './locales/bg.json'
import { defaultLanguage, isActiveLanguage, localeFromPathname, preferredLanguage, type LanguageCode } from './languages'

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

const localeLoaders: Record<Exclude<LanguageCode, 'bg'>, () => Promise<{ default: object }>> = {
  en: () => import('./locales/en.json'),
  de: () => import('./locales/de.json'),
  fr: () => import('./locales/fr.json'),
}

function pathRest(pathname: string) {
  return basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
    ? pathname.slice(basePath.length)
    : pathname
}

export function resolveInitialLanguage(pathname = window.location.pathname): LanguageCode {
  const fromPath = localeFromPathname(pathname, basePath)
  const rest = pathRest(pathname)
  const onAdmin = rest === '/admin' || rest.startsWith('/admin/')
  if (fromPath && isActiveLanguage(fromPath)) return fromPath
  if (onAdmin) return preferredLanguage()
  return defaultLanguage
}

const initialLanguage = resolveInitialLanguage()
const onAdmin = pathRest(window.location.pathname).startsWith('/admin')

export async function ensureLanguage(code: LanguageCode) {
  if (code !== 'bg' && !i18n.hasResourceBundle(code, 'translation')) {
    const mod = await localeLoaders[code]()
    i18n.addResourceBundle(code, 'translation', mod.default, true, true)
  }
  if (i18n.language !== code) await i18n.changeLanguage(code)
  document.documentElement.lang = code
}

export const i18nReady: Promise<void> = (async () => {
  await i18n.use(initReactI18next).init({
    resources: { bg: { translation: bg } },
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: { escapeValue: false },
  })
  if (onAdmin && initialLanguage !== 'en') await ensureLanguage('en')
  await ensureLanguage(initialLanguage)
})()

export default i18n

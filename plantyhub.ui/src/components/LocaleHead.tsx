import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { activeLanguages, defaultLanguage, type LanguageCode } from '../i18n/languages'
import { BASE_PATH, currentLocale } from '../paths'

const privatePrefixes = [
  '/cart',
  '/checkout',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/account',
  '/order',
]

function isPrivatePath(pathname: string) {
  return privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function publicPath(pathname: string) {
  if (pathname === '/') return '/'
  return pathname.replace(/\/$/, '') || '/'
}

function absoluteUrl(locale: LanguageCode, pathname: string) {
  const path = publicPath(pathname)
  const localized = path === '/' ? `/${locale}/` : `/${locale}${path}`
  return `${window.location.origin}${BASE_PATH}${localized}`
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

export default function LocaleHead() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()
  const locale = currentLocale()

  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale)
    document.documentElement.lang = locale

    const path = publicPath(pathname)
    const skipTitle = path.startsWith('/pods/')
    const isContact = path === '/contact'
    const isStart = path === '/start'
    const isHow = path === '/how-it-works'
    if (!skipTitle) {
      document.title = isContact
        ? `${t('supportPage.heroTitle')} · PlantyHub`
        : isStart
          ? `${t('startPage.title')} · PlantyHub`
          : isHow
            ? `${t('howPage.title')} · PlantyHub`
            : t('seo.title')
    }
    upsertMeta(
      'description',
      isContact
        ? `${t('supportPage.subtitle')} ${t('supportPage.responseText')}`
        : isStart
          ? t('startPage.lead')
          : isHow
            ? t('howPage.lead')
            : t('seo.description'),
    )
    upsertMeta('robots', isPrivatePath(path) ? 'noindex, follow' : 'index, follow')

    const canonical = absoluteUrl(locale, path)
    upsertLink('canonical', canonical)
    for (const language of activeLanguages) {
      upsertLink('alternate', absoluteUrl(language.code, path), language.code)
    }
    upsertLink('alternate', absoluteUrl(defaultLanguage, path), 'x-default')
  }, [i18n, locale, pathname, t])

  return null
}

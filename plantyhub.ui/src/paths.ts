import { isLanguageCode, localeFromPathname, preferredLanguage, type LanguageCode } from './i18n/languages'
import { toMediaUrl } from './media/cfImage'

/** Repo subpath on GitHub Pages, e.g. `/PlantyHub`. Empty when served from domain root. */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

const unprefixedPrefixes = ['/admin', '/api', '/health']

export function currentLocale(): LanguageCode {
  return localeFromPathname(window.location.pathname, BASE_PATH) ?? preferredLanguage()
}

/** Public storefront path with a language prefix. Admin and API paths stay as they are. */
export function localizePath(href: string, locale: LanguageCode = currentLocale()): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  if (unprefixedPrefixes.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))) return href

  const cut = ['#', '?'].map((mark) => href.indexOf(mark)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? href.length
  const path = href.slice(0, cut) || '/'
  const suffix = href.slice(cut)
  const first = path.split('/').filter(Boolean)[0]
  if (isLanguageCode(first)) return href

  const localized = path === '/' ? `/${locale}/` : `/${locale}${path}`
  return `${localized}${suffix}`
}

/** Prefix absolute in-app links with the deploy base path and language (anchors and plain hrefs). */
export function resolveHref(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  return `${BASE_PATH}${localizePath(href)}`
}

/** Public folder asset path — always served from Cloudflare R2. */
export function assetUrl(path: string): string {
  return toMediaUrl(path)
}

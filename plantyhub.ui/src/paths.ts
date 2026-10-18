import { defaultLanguage, isLanguageCode, localeFromPathname, preferredLanguage, type LanguageCode } from './i18n/languages'
import { toMediaUrl } from './media/cfImage'

/** Repo subpath on GitHub Pages, e.g. `/PlantyHub`. Empty when served from domain root. */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

const unprefixedPrefixes = ['/admin', '/api', '/health']

/** Bulgarian when the address has no language prefix. Admin keeps the saved choice. */
export function currentLocale(): LanguageCode {
  const fromPath = localeFromPathname(window.location.pathname, BASE_PATH)
  if (fromPath) return fromPath
  const rest = BASE_PATH && (window.location.pathname === BASE_PATH || window.location.pathname.startsWith(`${BASE_PATH}/`))
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname
  if (rest === '/admin' || rest.startsWith('/admin/')) return preferredLanguage()
  return defaultLanguage
}

/** Public storefront path with a language prefix. Admin and API paths stay as they are. */
export function localizePath(href: string, locale: LanguageCode = currentLocale()): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  if (unprefixedPrefixes.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))) return href

  const cut = ['#', '?'].map((mark) => href.indexOf(mark)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? href.length
  let path = href.slice(0, cut) || '/'
  const suffix = href.slice(cut)
  const segments = path.split('/').filter(Boolean)
  const first = segments[0]
  if (isLanguageCode(first)) {
    if (first === locale && first !== defaultLanguage) return href
    path = segments.length === 1 ? '/' : `/${segments.slice(1).join('/')}`
  }

  if (locale === defaultLanguage) return `${path === '/' ? '/' : path}${suffix}`

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

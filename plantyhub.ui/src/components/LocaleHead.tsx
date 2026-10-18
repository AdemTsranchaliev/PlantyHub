import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductReviews } from './ProductReviews'
import { activeLanguages } from '../i18n/languages'
import { currentLocale } from '../paths'
import { absoluteCanonical, alternateUrls, buildHead, OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, type HeadDocument } from '../seo/buildHead'
import { getProductsError, getProductsLoading, getProductsState, subscribeProducts } from '../store/products'

const ogLocales: Record<string, string> = { bg: 'bg_BG', en: 'en_US', de: 'de_DE', fr: 'fr_FR' }

function detailSlug(pathname: string) {
  const path = pathname === '/' ? '/' : pathname.replace(/\/$/, '') || '/'
  if (path === '/homegarder-one') return 'homegarder-one'
  const pod = path.match(/^\/pods\/([^/]+)$/)
  if (pod) return pod[1]
  const accessory = path.match(/^\/accessories\/([^/]+)$/)
  if (accessory) return accessory[1]
  return undefined
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function applyDocument(model: HeadDocument, locale: string) {
  const origin = window.location.origin
  const canonical = absoluteCanonical(origin, currentLocale(), model.canonicalPath)

  document.documentElement.lang = locale
  upsertMeta('name', 'robots', model.robots)
  upsertLink('canonical', canonical)
  const alternates = alternateUrls(origin, model.canonicalPath)
  for (const link of alternates) upsertLink('alternate', link.href, link.hreflang)
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => {
    const el = node as HTMLLinkElement
    if (!alternates.some((link) => link.hreflang === el.hreflang)) el.remove()
  })

  if (model.defer) return

  document.title = model.title
  upsertMeta('name', 'description', model.description)
  upsertMeta('property', 'og:site_name', 'PlantyHub')
  upsertMeta('property', 'og:type', model.type === 'article' ? 'article' : model.type === 'product' ? 'product' : 'website')
  upsertMeta('property', 'og:locale', ogLocales[locale] ?? 'bg_BG')
  document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((node) => node.remove())
  for (const language of activeLanguages) {
    if (language.code === locale) continue
    const el = document.createElement('meta')
    el.setAttribute('property', 'og:locale:alternate')
    el.content = ogLocales[language.code] ?? language.code
    document.head.appendChild(el)
  }
  upsertMeta('property', 'og:title', model.title)
  upsertMeta('property', 'og:description', model.description)
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('property', 'og:image', model.image)
  if (model.image === OG_IMAGE) {
    upsertMeta('property', 'og:image:width', String(OG_IMAGE_WIDTH))
    upsertMeta('property', 'og:image:height', String(OG_IMAGE_HEIGHT))
  } else {
    document.head.querySelector('meta[property="og:image:width"]')?.remove()
    document.head.querySelector('meta[property="og:image:height"]')?.remove()
  }
  upsertMeta('property', 'og:image:alt', model.title)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', model.title)
  upsertMeta('name', 'twitter:description', model.description)
  upsertMeta('name', 'twitter:image', model.image)
  if (model.price) {
    upsertMeta('property', 'product:price:amount', model.price)
    upsertMeta('property', 'product:price:currency', 'EUR')
  }
  if (model.published) upsertMeta('property', 'article:published_time', model.published)

  let script = document.getElementById('seo-jsonld') as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = 'seo-jsonld'
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(model.jsonLd).replace(/</g, '\\u003c')
}

export default function LocaleHead() {
  const { pathname, search } = useLocation()
  const { t, i18n } = useTranslation()
  const locale = currentLocale()
  const products = useSyncExternalStore(subscribeProducts, getProductsState, getProductsState)
  const loading = useSyncExternalStore(subscribeProducts, getProductsLoading, getProductsLoading)
  const error = useSyncExternalStore(subscribeProducts, getProductsError, getProductsError)
  const reviews = useProductReviews(detailSlug(pathname))
  const productsReady = !loading && (error != null || products.pods.length + products.accessories.length + products.gardens.length > 0)

  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale)
    const model = buildHead({
      origin: window.location.origin,
      locale,
      pathname,
      search,
      translate: t as (key: string, options?: Record<string, unknown>) => unknown,
      products,
      productsReady,
      reviews: reviews && reviews.count > 0 ? { average: reviews.average, count: reviews.count } : null,
    })
    applyDocument(model, locale)
  }, [error, i18n, loading, locale, pathname, products, productsReady, reviews, search, t])

  return null
}

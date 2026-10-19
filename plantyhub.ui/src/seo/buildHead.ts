import type { SchoolPack } from '../content/school/types'
import { isSchoolSection, isSchoolTopic, learnSearch, schoolSectionTopics } from '../content/school/outline'
import { blogArticleIds } from '../data/catalog'
import { activeLanguages, defaultLanguage, type LanguageCode } from '../i18n/languages'
import { toMediaUrl } from '../media/cfImage'
import { BASE_PATH } from '../paths'
import { getLocalizedField, type ProductCategory, type ProductsState, type StoredProduct } from '../store/products'

/** Wordmark on a 1200×630 card. Shown in link previews and as the organization logo. */
export const OG_IMAGE = 'https://plantyhub.com/logo-wordmark.png'
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

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
  '/review',
]

const articlePublished: Record<(typeof blogArticleIds)[number], string> = {
  pesto: '2025-06-12',
  hydroponics: '2025-05-28',
  spices: '2025-07-02',
  'first-harvest': '2025-06-20',
  partnership: '2025-05-10',
  earthday: '2025-04-22',
}

const pageKeys: Record<string, string> = {
  '/': 'home',
  '/homegarder-one': 'product',
  '/pods': 'pods',
  '/accessories': 'accessories',
  '/about': 'about',
  '/blog': 'blog',
  '/contact': 'contact',
  '/faq': 'faq',
  '/learn': 'learn',
  '/how-it-works': 'how',
  '/start': 'start',
  '/privacy': 'privacy',
  '/cookies': 'cookies',
  '/terms': 'terms',
}

type Translate = (key: string, options?: Record<string, unknown>) => unknown

export type HeadDocument = {
  defer: boolean
  title: string
  description: string
  robots: string
  canonicalPath: string
  type: 'website' | 'article' | 'product'
  image: string
  published?: string
  price?: string
  jsonLd: Record<string, unknown>
}

type Crumb = { name: string; path: string }

type Reviews = { average: number; count: number } | null

function text(translate: Translate, key: string, options?: Record<string, unknown>) {
  const value = translate(key, options)
  return typeof value === 'string' ? value : ''
}

function clip(value: string, max = 158) {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > 80 ? cut.slice(0, space) : cut).trimEnd()}…`
}

function publicPath(pathname: string) {
  if (pathname === '/') return '/'
  return pathname.replace(/\/$/, '') || '/'
}

function isPrivate(path: string) {
  return privatePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

function isArticle(slug: string): slug is (typeof blogArticleIds)[number] {
  return (blogArticleIds as readonly string[]).includes(slug)
}

function pageCopy(translate: Translate, key: string) {
  return {
    title: text(translate, `seo.pages.${key}.title`) || text(translate, 'seo.title'),
    description: text(translate, `seo.pages.${key}.description`) || text(translate, 'seo.description'),
  }
}

function euroAmount(price: string) {
  const amount = Number(price.replace(/[^\d.,]/g, '').replace(',', '.'))
  return Number.isFinite(amount) ? amount.toFixed(2) : undefined
}

function absoluteImage(src: string | undefined) {
  if (!src) return OG_IMAGE
  const resolved = toMediaUrl(src)
  return resolved.startsWith('http') ? resolved : OG_IMAGE
}

function findProduct(state: ProductsState, category: ProductCategory, id: string | undefined) {
  if (!id) return undefined
  return state[category].find((product) => product.id === id && product.active)
}

function productDetail(path: string): { category: ProductCategory; id: string } | null {
  if (path === '/homegarder-one') return { category: 'gardens', id: 'homegarder-one' }
  const pod = path.match(/^\/pods\/([^/]+)$/)
  if (pod) return { category: 'pods', id: pod[1] }
  const accessory = path.match(/^\/accessories\/([^/]+)$/)
  if (accessory) return { category: 'accessories', id: accessory[1] }
  return null
}

function originUrl(origin: string, locale: LanguageCode, path: string) {
  const mark = path.indexOf('?')
  const pathname = (mark < 0 ? path : path.slice(0, mark)) || '/'
  const query = mark < 0 ? '' : path.slice(mark)
  const localized = locale === defaultLanguage
    ? (pathname === '/' ? '/' : pathname)
    : (pathname === '/' ? `/${locale}/` : `/${locale}${pathname}`)
  return `${origin}${BASE_PATH}${localized}${query}`
}

export function buildHead(input: {
  origin: string
  locale: LanguageCode
  pathname: string
  search: string
  translate: Translate
  products: ProductsState
  productsReady: boolean
  reviews: Reviews
  school?: SchoolPack | null
}): HeadDocument {
  const path = publicPath(input.pathname)
  const detail = productDetail(path)
  const articleSlug = path.startsWith('/blog/') ? path.slice('/blog/'.length) : ''
  const article = isArticle(articleSlug) ? articleSlug : null
  const learnQuery = path === '/learn' ? learnSearch(new URLSearchParams(input.search).get('section'), new URLSearchParams(input.search).get('topic')) : ''
  const canonicalPath = `${path === '/' ? '/' : path}${learnQuery}`
  const homeName = input.locale === 'en' ? 'Home' : 'Начало'
  const crumbs: Crumb[] = [{ name: homeName, path: '/' }]

  let title = text(input.translate, 'seo.title')
  let description = text(input.translate, 'seo.description')
  let type: HeadDocument['type'] = 'website'
  let image = OG_IMAGE
  let published: string | undefined
  let price: string | undefined
  let defer = false
  let missing = false
  const extra: Record<string, unknown>[] = []

  const key = pageKeys[path]
  if (key) {
    const copy = pageCopy(input.translate, key)
    title = copy.title
    description = copy.description
  }

  if (article) {
    const articleTitle = text(input.translate, `blogPage.articles.${article}.title`)
    const excerpt = text(input.translate, `blogPage.articles.${article}.excerpt`)
    title = text(input.translate, 'seo.articleTitle', { title: articleTitle })
    description = clip(excerpt || description)
    type = 'article'
    published = articlePublished[article]
    crumbs.push({ name: text(input.translate, 'nav.blog') || 'Blog', path: '/blog' }, { name: articleTitle, path })
    extra.push(articleNode(input, canonicalPath, title, description, published))
  } else if (detail && detail.category !== 'gardens') {
    const product = findProduct(input.products, detail.category, detail.id)
    if (!product && !input.productsReady) {
      defer = true
    } else if (!product) {
      missing = true
      title = 'PlantyHub'
    } else {
      const name = getLocalizedField(product, 'name', input.locale) || product.id
      const detailText = getLocalizedField(product, 'description', input.locale) || getLocalizedField(product, 'tagline', input.locale)
      const template = detail.category === 'pods' ? 'seo.podTitle' : 'seo.accessoryTitle'
      title = text(input.translate, template, { name })
      description = clip(detailText || text(input.translate, 'seo.podFallback', { name }))
      type = 'product'
      image = absoluteImage(product.image)
      price = euroAmount(product.price)
      const parentPath = detail.category === 'pods' ? '/pods' : '/accessories'
      const parentName = text(input.translate, detail.category === 'pods' ? 'nav.pods' : 'nav.accessories')
      crumbs.push({ name: parentName, path: parentPath }, { name, path })
      extra.push(productNode(input, product, canonicalPath, name, description, price, image))
    }
  } else if (detail?.category === 'gardens') {
    const product = findProduct(input.products, 'gardens', 'homegarder-one')
    type = 'product'
    crumbs.push({ name: crumbLabel(title), path })
    if (product) {
      image = absoluteImage(product.image)
      price = euroAmount(product.price)
      const name = getLocalizedField(product, 'name', input.locale) || 'HomeGarder One'
      extra.push(productNode(input, product, canonicalPath, name, description, price, image))
    }
  } else if (path === '/learn') {
    const params = new URLSearchParams(input.search)
    const sectionId = params.get('section')
    const topicId = params.get('topic')
    const school = input.school
    crumbs.push({ name: crumbLabel(title), path: '/learn' })
    if (school && isSchoolSection(sectionId)) {
      const section = school.sections[sectionId]
      crumbs.push({ name: section.title, path: `/learn?section=${sectionId}` })
      if (isSchoolTopic(topicId) && schoolSectionTopics[sectionId].includes(topicId)) {
        const topic = school.topics[topicId]
        title = text(input.translate, 'seo.lessonTitle', { title: topic.title })
        description = clip(topic.summary || topic.lead || section.description)
        crumbs.push({ name: topic.title, path: canonicalPath })
        if (topic.steps && topic.steps.length > 1) extra.push(howToNode(input, canonicalPath, topic.title, description, topic.steps))
      } else {
        title = text(input.translate, 'seo.lessonTitle', { title: section.title })
        description = clip(section.description || description)
      }
    }
  } else if (path === '/faq') {
    crumbs.push({ name: crumbLabel(title), path })
    extra.push(faqNode(input))
  } else if (path === '/pods' || path === '/accessories') {
    crumbs.push({ name: crumbLabel(title), path })
    const category: ProductCategory = path === '/pods' ? 'pods' : 'accessories'
    const list = itemListNode(input, category, path)
    if (list.itemListElement.length > 0) extra.push(list)
  } else if (path !== '/' && !missing) {
    crumbs.push({ name: crumbLabel(title), path })
  }

  if (article === null && path.startsWith('/blog/')) {
    missing = true
    title = 'PlantyHub'
  }

  const robots = isPrivate(path) || missing ? 'noindex, follow' : 'index, follow'
  const graph = graphNode(input, canonicalPath, title, description, image, crumbs, extra)

  return { defer, title, description, robots, canonicalPath, type, image, published, price, jsonLd: graph }
}

function crumbLabel(title: string) {
  const cut = title.includes('·') ? title.indexOf('·') : title.indexOf('—')
  return (cut > 0 ? title.slice(0, cut) : title).trim()
}

function graphNode(
  input: { origin: string; locale: LanguageCode },
  canonicalPath: string,
  title: string,
  description: string,
  image: string,
  crumbs: Crumb[],
  extra: Record<string, unknown>[],
) {
  const canonical = originUrl(input.origin, input.locale, canonicalPath)
  const orgId = `${input.origin}/#organization`
  const siteId = `${input.origin}/#website`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'PlantyHub',
        legalName: 'ДИДЖИТАЛ КИТ ЕООД',
        url: `${input.origin}/`,
        logo: {
          '@type': 'ImageObject',
          url: OG_IMAGE,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
        },
        email: 'support@plantyhub.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ул. Никифор П. Константинов',
          postalCode: '4400',
          addressLocality: 'Пазарджик',
          addressCountry: 'BG',
        },
        areaServed: { '@type': 'Country', name: 'Bulgaria' },
        sameAs: [
          'https://instagram.com/plantyhub.official',
          'https://tiktok.com/@plantyhub.official',
          'https://facebook.com/plantyhub',
          'https://www.youtube.com/@PlantyHub1',
          'https://linkedin.com/company/plantyhub',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        name: 'PlantyHub',
        url: `${input.origin}/`,
        inLanguage: activeLanguages.map((language) => language.code),
        publisher: { '@id': orgId },
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: input.locale,
        isPartOf: { '@id': siteId },
        about: { '@id': orgId },
        primaryImageOfPage: image,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: originUrl(input.origin, input.locale, crumb.path),
        })),
      },
      ...extra,
    ],
  }
}

function productNode(
  input: { origin: string; locale: LanguageCode; reviews: Reviews },
  product: StoredProduct,
  canonicalPath: string,
  name: string,
  description: string,
  price: string | undefined,
  image: string,
) {
  const canonical = originUrl(input.origin, input.locale, canonicalPath)
  return {
    '@type': 'Product',
    name,
    description,
    image,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'PlantyHub' },
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'EUR',
      price: price ?? '0.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      areaServed: 'BG',
    },
    ...(input.reviews && input.reviews.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: input.reviews.average.toFixed(1),
            reviewCount: input.reviews.count,
          },
        }
      : {}),
  }
}

function articleNode(
  input: { origin: string; locale: LanguageCode },
  canonicalPath: string,
  title: string,
  description: string,
  published: string,
) {
  return {
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: published,
    dateModified: published,
    inLanguage: input.locale,
    image: OG_IMAGE,
    mainEntityOfPage: originUrl(input.origin, input.locale, canonicalPath),
    author: { '@id': `${input.origin}/#organization` },
    publisher: { '@id': `${input.origin}/#organization` },
  }
}

function howToNode(
  input: { origin: string; locale: LanguageCode },
  canonicalPath: string,
  name: string,
  description: string,
  steps: string[],
) {
  return {
    '@type': 'HowTo',
    name,
    description,
    inLanguage: input.locale,
    url: originUrl(input.origin, input.locale, canonicalPath),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
  }
}

function faqNode(input: { translate: Translate }) {
  const categories = input.translate('faqPage.categories', { returnObjects: true })
  const questions = Array.isArray(categories)
    ? categories.flatMap((category) => {
        const items = (category as { items?: { q?: string; a?: string }[] }).items
        return Array.isArray(items) ? items : []
      })
    : []

  return {
    '@type': 'FAQPage',
    mainEntity: questions
      .filter((item) => item.q && item.a)
      .map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
  }
}

function itemListNode(input: { origin: string; locale: LanguageCode; products: ProductsState }, category: ProductCategory, path: string) {
  const items = input.products[category].filter((product) => product.active)
  return {
    '@type': 'ItemList',
    itemListElement: items.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: getLocalizedField(product, 'name', input.locale) || product.id,
      url: originUrl(input.origin, input.locale, `${path}/${product.id}`),
    })),
  }
}

export function alternateUrls(origin: string, canonicalPath: string) {
  const [path, query = ''] = splitQuery(canonicalPath)
  const localized = `${path}${query}`
  return [
    ...activeLanguages.map((language) => ({
      hreflang: language.code,
      href: originUrl(origin, language.code, localized),
    })),
    {
      hreflang: 'x-default',
      href: originUrl(origin, defaultLanguage, localized),
    },
  ]
}

function splitQuery(value: string): [string, string] {
  const mark = value.indexOf('?')
  if (mark < 0) return [value || '/', '']
  return [value.slice(0, mark) || '/', value.slice(mark)]
}

export function absoluteCanonical(origin: string, locale: LanguageCode, canonicalPath: string) {
  const [path, query] = splitQuery(canonicalPath)
  return originUrl(origin, locale, `${path}${query}`)
}

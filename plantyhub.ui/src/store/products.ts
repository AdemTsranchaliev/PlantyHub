import {
  gardensCatalog,
  seedPodsCatalog,
  consumablesCatalog,
  accessoriesCatalog,
} from '../data/catalog'
import type { LanguageCode } from '../i18n/languages'
import en from '../i18n/locales/en.json'
import bg from '../i18n/locales/bg.json'
import de from '../i18n/locales/de.json'
import fr from '../i18n/locales/fr.json'
import { mapProductsResponse, productsApi, toProductUpsert } from '../api'

export type ProductCategory = 'gardens' | 'pods' | 'consumables' | 'accessories'

export type ProductSpec = {
  label: string
  value: string
}

export type ProductFeature = {
  title: string
  text: string
}

export type ProductFaq = {
  q: string
  a: string
}

export type ProductLocaleContent = {
  name: string
  tagline?: string
  description?: string
  videoBadge?: string
  videoTitle?: string
  videoText?: string
  specs?: ProductSpec[]
  highlightsTitle?: string
  highlightsSubtitle?: string
  specsTitle?: string
  howTitle?: string
  boxTitle?: string
  faqTitle?: string
  features?: ProductFeature[]
  steps?: string[]
  inTheBox?: string[]
  faq?: ProductFaq[]
}

export type ProductColor = { id: string; hex: string }

export type ProductKit = {
  pods: number
  caps: number
  nutrientMl: number
}

export type StoredProduct = {
  id: string
  price: string
  compareAt?: string
  packKey?: string
  kit?: ProductKit
  image: string
  imageFit: 'cover' | 'contain'
  gallery?: string[]
  videoUrl?: string
  videoPoster?: string
  featured?: boolean
  active: boolean
  colors?: ProductColor[]
  locales: Partial<Record<LanguageCode, ProductLocaleContent>>
}

export type ProductsState = Record<ProductCategory, StoredProduct[]>

const emptyProductsState: ProductsState = {
  gardens: [],
  pods: [],
  consumables: [],
  accessories: [],
}

const locales = { en, bg, de, fr } as const
const listeners = new Set<() => void>()
let cachedState: ProductsState | null = null
let loading = false
let loadError: string | null = null

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeProducts(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getProductsLoading() {
  return loading
}

export function getProductsError() {
  return loadError
}

function readLocaleField(
  lang: LanguageCode,
  category: ProductCategory,
  id: string,
  field: keyof ProductLocaleContent,
): string | undefined {
  const products = locales[lang].products as Record<string, Record<string, Record<string, string>>>
  return products[category]?.[id]?.[field]
}

function buildLocales(category: ProductCategory, id: string): Partial<Record<LanguageCode, ProductLocaleContent>> {
  const result: Partial<Record<LanguageCode, ProductLocaleContent>> = {}
  for (const lang of Object.keys(locales) as LanguageCode[]) {
    const name = readLocaleField(lang, category, id, 'name')
    if (!name) continue
    result[lang] = {
      name,
      tagline: readLocaleField(lang, category, id, 'tagline'),
      description: readLocaleField(lang, category, id, 'description'),
    }
  }
  return result
}

function bootstrapCategory(
  category: ProductCategory,
  items: readonly {
    id: string
    price: string
    image: string
    imageFit: 'cover' | 'contain'
    packKey?: string
    compareAt?: string
    featured?: boolean
    colors?: readonly { id: string; hex: string }[]
  }[],
): StoredProduct[] {
  return items.map((item) => ({
    id: item.id,
    price: item.price,
    compareAt: 'compareAt' in item ? item.compareAt : undefined,
    packKey: 'packKey' in item ? item.packKey : undefined,
    image: item.image,
    imageFit: item.imageFit,
    featured: 'featured' in item ? item.featured : undefined,
    colors: 'colors' in item && item.colors ? [...item.colors] : undefined,
    active: true,
    locales: buildLocales(category, item.id),
  }))
}

export function createDefaultProductsState(): ProductsState {
  return {
    gardens: bootstrapCategory('gardens', gardensCatalog),
    pods: bootstrapCategory('pods', seedPodsCatalog),
    consumables: bootstrapCategory('consumables', consumablesCatalog),
    accessories: bootstrapCategory('accessories', accessoriesCatalog),
  }
}

function setState(state: ProductsState) {
  cachedState = state
  emit()
}

export function getProductsState(): ProductsState {
  return cachedState ?? emptyProductsState
}

export async function loadProducts(admin = false): Promise<ProductsState> {
  loading = true
  loadError = null
  emit()

  try {
    const data = admin ? await productsApi.getAdmin() : await productsApi.getPublic()
    const state = mapProductsResponse(data)
    setState(state)
    return state
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load products'
    emit()
    return getProductsState()
  } finally {
    loading = false
    emit()
  }
}

export async function addProduct(category: ProductCategory, product: StoredProduct): Promise<boolean> {
  await productsApi.create(toProductUpsert(product, category))
  await loadProducts(true)
  await loadProducts(false)
  return true
}

export async function updateProduct(category: ProductCategory, id: string, product: StoredProduct) {
  await productsApi.update(id, toProductUpsert({ ...product, id }, category))
  await loadProducts(true)
  await loadProducts(false)
}

export async function deleteProduct(_category: ProductCategory, id: string) {
  await productsApi.delete(id)
  await loadProducts(true)
  await loadProducts(false)
}

export function getProduct(category: ProductCategory, id: string): StoredProduct | undefined {
  return getProductsState()[category].find((p) => p.id === id)
}

type LocaleStringField = 'name' | 'tagline' | 'description' | 'videoBadge' | 'videoTitle' | 'videoText'

export function getLocalizedField(
  product: StoredProduct,
  field: LocaleStringField,
  lang: LanguageCode,
): string {
  return (
    product.locales[lang]?.[field] ??
    product.locales.en?.[field] ??
    Object.values(product.locales)[0]?.[field] ??
    ''
  )
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const packKeyOptions = ['pack3', 'pack9', 'pack12', 'bottle1L', 'bottle2x100ml'] as const

export function packSize(packKey?: string) {
  const match = packKey?.match(/^pack(\d+)$/)
  return match ? Number(match[1]) : 0
}

export function resolveKit(product: { packKey?: string; kit?: ProductKit }): ProductKit {
  if (product.kit && (product.kit.pods || product.kit.caps || product.kit.nutrientMl)) return product.kit
  const pods = packSize(product.packKey)
  if (pods > 0) return { pods, caps: pods, nutrientMl: 100 }
  return { pods: 0, caps: 0, nutrientMl: 0 }
}

// Legacy stubs for settings page
export function resetProductsState() {
  cachedState = null
  loadError = null
  emit()
}

export function saveProductsState(state: ProductsState) {
  setState(state)
}

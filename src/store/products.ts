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

export type ProductCategory = 'gardens' | 'pods' | 'consumables' | 'accessories'

export type ProductLocaleContent = {
  name: string
  tagline?: string
  description?: string
}

export type ProductColor = { id: string; hex: string }

export type StoredProduct = {
  id: string
  price: string
  compareAt?: string
  packKey?: string
  image: string
  imageFit: 'cover' | 'contain'
  featured?: boolean
  active: boolean
  colors?: ProductColor[]
  locales: Partial<Record<LanguageCode, ProductLocaleContent>>
}

export type ProductsState = Record<ProductCategory, StoredProduct[]>

const STORAGE_KEY = 'plantyhub_products'
const locales = { en, bg, de, fr } as const

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeProducts(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
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

function mergeWithDefaults(stored: ProductsState): ProductsState {
  const defaults = createDefaultProductsState()
  const categories: ProductCategory[] = ['gardens', 'pods', 'consumables', 'accessories']
  const result = { ...defaults }

  for (const cat of categories) {
    const storedMap = new Map((stored[cat] ?? []).map((p) => [p.id, p]))
    const merged = defaults[cat].map((def) => {
      const existing = storedMap.get(def.id)
      if (!existing) return def
      return {
        ...def,
        ...existing,
        locales: { ...def.locales, ...existing.locales },
      }
    })
    for (const p of stored[cat] ?? []) {
      if (!defaults[cat].some((d) => d.id === p.id)) merged.push(p)
    }
    result[cat] = merged
  }

  return result
}

let cachedState: ProductsState | null = null

export function getProductsState(): ProductsState {
  if (cachedState) return cachedState

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ProductsState
      cachedState = mergeWithDefaults(parsed)
      return cachedState
    }
  } catch {
    // fall through to defaults
  }

  cachedState = createDefaultProductsState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedState))
  return cachedState
}

function persist(state: ProductsState) {
  cachedState = state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  emit()
}

export function saveProductsState(state: ProductsState) {
  persist(state)
}

export function resetProductsState() {
  persist(createDefaultProductsState())
}

export function updateProduct(category: ProductCategory, id: string, patch: Partial<StoredProduct>) {
  const state = getProductsState()
  const next = {
    ...state,
    [category]: state[category].map((p) => (p.id === id ? { ...p, ...patch, id: p.id } : p)),
  }
  persist(next)
}

export function addProduct(category: ProductCategory, product: StoredProduct) {
  const state = getProductsState()
  if (state[category].some((p) => p.id === product.id)) return false
  persist({ ...state, [category]: [...state[category], product] })
  return true
}

export function getProduct(category: ProductCategory, id: string): StoredProduct | undefined {
  return getProductsState()[category].find((p) => p.id === id)
}

export function getLocalizedField(
  product: StoredProduct,
  field: keyof ProductLocaleContent,
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

import { useMemo, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import type { LanguageCode } from '../i18n/languages'
import {
  type ProductCategory,
  type ProductLocaleContent,
  type StoredProduct,
  getLocalizedField,
  getProductsState,
  subscribeProducts,
  updateProduct,
  addProduct,
  resetProductsState,
  saveProductsState,
  createDefaultProductsState,
} from '../store/products'

export type ResolvedProduct = StoredProduct & {
  name: string
  tagline?: string
  description?: string
}

function resolveProduct(product: StoredProduct, lang: LanguageCode): ResolvedProduct {
  return {
    ...product,
    name: getLocalizedField(product, 'name', lang),
    tagline: getLocalizedField(product, 'tagline', lang) || undefined,
    description: getLocalizedField(product, 'description', lang) || undefined,
  }
}

function useProductsState() {
  return useSyncExternalStore(subscribeProducts, getProductsState, getProductsState)
}

function useLang(): LanguageCode {
  const { i18n } = useTranslation()
  const code = i18n.language?.split('-')[0] ?? 'en'
  if (code === 'bg' || code === 'de' || code === 'fr') return code
  return 'en'
}

export function useProductStore() {
  const state = useProductsState()
  return {
    state,
    updateProduct,
    addProduct,
    resetProductsState,
    saveProductsState,
    createDefaultProductsState,
  }
}

export function useCategoryProducts(category: ProductCategory, activeOnly = false): ResolvedProduct[] {
  const state = useProductsState()
  const lang = useLang()
  return useMemo(() => {
    const list = state[category]
    const filtered = activeOnly ? list.filter((p) => p.active) : list
    return filtered.map((p) => resolveProduct(p, lang))
  }, [state, category, lang, activeOnly])
}

export function useProduct(category: ProductCategory, id: string | undefined): ResolvedProduct | undefined {
  const state = useProductsState()
  const lang = useLang()
  return useMemo(() => {
    if (!id) return undefined
    const product = state[category].find((p) => p.id === id)
    return product ? resolveProduct(product, lang) : undefined
  }, [state, category, id, lang])
}

export function useProductText(
  category: ProductCategory,
  id: string,
  field: keyof ProductLocaleContent,
): string {
  const state = useProductsState()
  const lang = useLang()
  return useMemo(() => {
    const product = state[category].find((p) => p.id === id)
    if (!product) return ''
    return getLocalizedField(product, field, lang)
  }, [state, category, id, field, lang])
}

/** @deprecated prefer useCategoryProducts — kept for gradual migration */
export function useGardensCatalog(activeOnly = true) {
  return useCategoryProducts('gardens', activeOnly)
}

export function useSeedPodsCatalog(activeOnly = true) {
  return useCategoryProducts('pods', activeOnly)
}

export function useConsumablesCatalog(activeOnly = true) {
  return useCategoryProducts('consumables', activeOnly)
}

export function useAccessoriesCatalog(activeOnly = true) {
  return useCategoryProducts('accessories', activeOnly)
}

export function toProductCardData(
  product: ResolvedProduct,
  t: (key: string) => string,
) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    compareAt: product.compareAt,
    image: product.image,
    imageFit: product.imageFit,
    pack: product.packKey ? t(`common.${product.packKey}`) : undefined,
    tagline: product.tagline,
  }
}

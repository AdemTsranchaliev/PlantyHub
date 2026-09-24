import { productSpecRows } from '../data/catalog'
import { lifestyleImages, productVideo, productVideoPoster } from '../data/images'
import type { LanguageCode } from '../i18n/languages'
import bg from '../i18n/locales/bg.json'
import de from '../i18n/locales/de.json'
import en from '../i18n/locales/en.json'
import fr from '../i18n/locales/fr.json'
import type { ProductFaq, ProductFeature, ProductLocaleContent, ProductSpec } from '../store/products'

const locales = { en, bg, de, fr } as const

export const defaultGardenGallery = [
  lifestyleImages.homeGardenProduct,
  lifestyleImages.kitchenBasil,
  lifestyleImages.basilCloseup,
  lifestyleImages.mintKitchen,
  lifestyleImages.heroKitchen,
]

export const defaultGardenVideo = productVideo
export const defaultGardenVideoPoster = productVideoPoster

export function defaultGardenLocale(lang: LanguageCode): Omit<ProductLocaleContent, 'name' | 'tagline' | 'description'> {
  const pack = locales[lang]
  const specsSource = pack.product.specs as Record<string, string>
  const specs: ProductSpec[] = productSpecRows.map((row) => ({
    label: specsSource[row.key] ?? '',
    value: specsSource[row.valueKey] ?? '',
  }))
  const features = pack.pdp.features as Record<string, { title: string; text: string }>
  const featureList: ProductFeature[] = Object.values(features).map((item) => ({ title: item.title, text: item.text }))
  const box = pack.pdp.inTheBoxItems as Record<string, string>
  return {
    videoBadge: pack.pdp.videoBadge,
    videoTitle: pack.pdp.videoTitle,
    videoText: pack.pdp.videoText,
    highlightsTitle: pack.pdp.highlightsTitle,
    highlightsSubtitle: pack.pdp.highlightsSubtitle,
    specsTitle: pack.pdp.specsTitle,
    howTitle: pack.pdp.howItWorksTitle,
    boxTitle: pack.pdp.inTheBox,
    faqTitle: pack.faqPage.title,
    specs,
    features: featureList,
    steps: [...pack.pdp.steps],
    inTheBox: Object.values(box),
    faq: pack.faqPage.categories.flatMap((category) =>
      category.items.map((item) => ({ q: item.q, a: item.a }) satisfies ProductFaq),
    ),
  }
}

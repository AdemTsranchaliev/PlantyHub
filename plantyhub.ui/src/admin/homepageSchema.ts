import { lifestyleImages, stockImages } from '../data/images'
import { socialProofImages } from '../data/catalog'

export type HomepageSectionKey =
  | 'hero'
  | 'growSmarter'
  | 'product'
  | 'howItWorks'
  | 'lightCycle'
  | 'podsGrid'
  | 'socialProof'
  | 'guarantees'
  | 'accessories'
  | 'cta'

export type FieldGroup =
  | 'heading'
  | 'buttons'
  | 'trust'
  | 'stats'
  | 'photo'
  | 'cards'
  | 'specs'
  | 'steps'
  | 'cycle'
  | 'days'
  | 'reviews'
  | 'items'
  | 'form'

type FieldBase = {
  key: string
  labelKey: string
  group: FieldGroup
  cluster?: string
}

export type SchemaField =
  | ({ kind: 'text' } & FieldBase)
  | ({ kind: 'textarea' } & FieldBase)
  | ({ kind: 'image'; defaultUrl: string } & FieldBase)

export const homepageSectionOrder: HomepageSectionKey[] = [
  'hero',
  'growSmarter',
  'product',
  'howItWorks',
  'lightCycle',
  'podsGrid',
  'socialProof',
  'guarantees',
  'accessories',
  'cta',
]

export const homepageSectionMeta: Record<
  HomepageSectionKey,
  { href: string; previewKey: string; imageKey?: string }
> = {
  hero: { href: '/', previewKey: 'hero.title', imageKey: 'hero.main' },
  growSmarter: { href: '/', previewKey: 'growSmarter.title', imageKey: 'growSmarter.main' },
  product: { href: '/#product', previewKey: 'product.title', imageKey: 'product.main' },
  howItWorks: { href: '/#how-it-works', previewKey: 'howItWorks.title' },
  lightCycle: { href: '/', previewKey: 'lightCycle.title' },
  podsGrid: { href: '/#pods', previewKey: 'podsSection.title' },
  socialProof: { href: '/', previewKey: 'socialProof.statLabel' },
  guarantees: { href: '/', previewKey: 'guarantees.title' },
  accessories: { href: '/#accessories', previewKey: 'accessoriesSection.title' },
  cta: { href: '/#cta', previewKey: 'cta.title', imageKey: 'cta.main' },
}

export const homepageSectionsSchema: Record<HomepageSectionKey, SchemaField[]> = {
  hero: [
    { kind: 'text', key: 'hero.badge', labelKey: 'admin.homepage.fields.hero.badge', group: 'heading' },
    { kind: 'text', key: 'hero.title', labelKey: 'admin.homepage.fields.hero.title', group: 'heading' },
    { kind: 'text', key: 'hero.promise', labelKey: 'admin.homepage.fields.hero.promise', group: 'heading' },
    { kind: 'textarea', key: 'hero.description', labelKey: 'admin.homepage.fields.hero.description', group: 'heading' },
    { kind: 'text', key: 'hero.ctaPrimary', labelKey: 'admin.homepage.fields.hero.ctaPrimary', group: 'buttons' },
    { kind: 'text', key: 'hero.ctaSecondary', labelKey: 'admin.homepage.fields.hero.ctaSecondary', group: 'buttons' },
    { kind: 'text', key: 'hero.priceLabel', labelKey: 'admin.homepage.fields.hero.priceLabel', group: 'buttons' },
    { kind: 'text', key: 'hero.trust.shipping', labelKey: 'admin.homepage.fields.hero.trustShipping', group: 'trust' },
    { kind: 'text', key: 'hero.stats.pods.value', labelKey: 'admin.homepage.fields.hero.statPodsValue', group: 'stats', cluster: 'pods' },
    { kind: 'text', key: 'hero.stats.pods.label', labelKey: 'admin.homepage.fields.hero.statPodsLabel', group: 'stats', cluster: 'pods' },
    { kind: 'text', key: 'hero.stats.light.value', labelKey: 'admin.homepage.fields.hero.statLightValue', group: 'stats', cluster: 'light' },
    { kind: 'text', key: 'hero.stats.light.label', labelKey: 'admin.homepage.fields.hero.statLightLabel', group: 'stats', cluster: 'light' },
    { kind: 'text', key: 'hero.stats.height.value', labelKey: 'admin.homepage.fields.hero.statHeightValue', group: 'stats', cluster: 'height' },
    { kind: 'text', key: 'hero.stats.height.label', labelKey: 'admin.homepage.fields.hero.statHeightLabel', group: 'stats', cluster: 'height' },
    { kind: 'image', key: 'hero.main', labelKey: 'admin.homepage.fields.hero.image', group: 'photo', defaultUrl: stockImages.homeGardenProduct },
    { kind: 'text', key: 'hero.imageAlt', labelKey: 'admin.homepage.fields.hero.imageAlt', group: 'photo' },
  ],
  growSmarter: [
    { kind: 'text', key: 'growSmarter.subtitle', labelKey: 'admin.homepage.fields.growSmarter.subtitle', group: 'heading' },
    { kind: 'text', key: 'growSmarter.title', labelKey: 'admin.homepage.fields.growSmarter.title', group: 'heading' },
    { kind: 'text', key: 'growSmarter.items.zero.title', labelKey: 'admin.homepage.fields.growSmarter.zeroTitle', group: 'cards', cluster: 'zero' },
    { kind: 'textarea', key: 'growSmarter.items.zero.description', labelKey: 'admin.homepage.fields.growSmarter.zeroDesc', group: 'cards', cluster: 'zero' },
    { kind: 'text', key: 'growSmarter.items.noSoil.title', labelKey: 'admin.homepage.fields.growSmarter.noSoilTitle', group: 'cards', cluster: 'noSoil' },
    { kind: 'textarea', key: 'growSmarter.items.noSoil.description', labelKey: 'admin.homepage.fields.growSmarter.noSoilDesc', group: 'cards', cluster: 'noSoil' },
    { kind: 'text', key: 'growSmarter.items.fresh.title', labelKey: 'admin.homepage.fields.growSmarter.freshTitle', group: 'cards', cluster: 'fresh' },
    { kind: 'textarea', key: 'growSmarter.items.fresh.description', labelKey: 'admin.homepage.fields.growSmarter.freshDesc', group: 'cards', cluster: 'fresh' },
    { kind: 'image', key: 'growSmarter.main', labelKey: 'admin.homepage.fields.growSmarter.image', group: 'photo', defaultUrl: lifestyleImages.basilCloseup },
  ],
  product: [
    { kind: 'text', key: 'product.eyebrow', labelKey: 'admin.homepage.fields.product.eyebrow', group: 'heading' },
    { kind: 'text', key: 'product.title', labelKey: 'admin.homepage.fields.product.title', group: 'heading' },
    { kind: 'textarea', key: 'product.description', labelKey: 'admin.homepage.fields.product.description', group: 'heading' },
    { kind: 'text', key: 'product.cta', labelKey: 'admin.homepage.fields.product.cta', group: 'buttons' },
    { kind: 'text', key: 'product.trust.shipping', labelKey: 'admin.homepage.fields.product.trustShipping', group: 'trust' },
    { kind: 'text', key: 'product.trust.guarantee', labelKey: 'admin.homepage.fields.product.trustGuarantee', group: 'trust' },
    { kind: 'text', key: 'product.trust.returns', labelKey: 'admin.homepage.fields.product.trustReturns', group: 'trust' },
    { kind: 'text', key: 'product.specs.pods', labelKey: 'admin.homepage.fields.product.specPods', group: 'specs', cluster: 'pods' },
    { kind: 'text', key: 'product.specs.podsValue', labelKey: 'admin.homepage.fields.product.specPodsValue', group: 'specs', cluster: 'pods' },
    { kind: 'text', key: 'product.specs.light', labelKey: 'admin.homepage.fields.product.specLight', group: 'specs', cluster: 'light' },
    { kind: 'text', key: 'product.specs.lightValue', labelKey: 'admin.homepage.fields.product.specLightValue', group: 'specs', cluster: 'light' },
    { kind: 'text', key: 'product.specs.growthHeight', labelKey: 'admin.homepage.fields.product.specHeight', group: 'specs', cluster: 'height' },
    { kind: 'text', key: 'product.specs.growthHeightValue', labelKey: 'admin.homepage.fields.product.specHeightValue', group: 'specs', cluster: 'height' },
    { kind: 'text', key: 'product.specs.irrigation', labelKey: 'admin.homepage.fields.product.specIrrigation', group: 'specs', cluster: 'irrigation' },
    { kind: 'text', key: 'product.specs.irrigationValue', labelKey: 'admin.homepage.fields.product.specIrrigationValue', group: 'specs', cluster: 'irrigation' },
    { kind: 'text', key: 'product.specs.nutrients', labelKey: 'admin.homepage.fields.product.specNutrients', group: 'specs', cluster: 'nutrients' },
    { kind: 'text', key: 'product.specs.nutrientsValue', labelKey: 'admin.homepage.fields.product.specNutrientsValue', group: 'specs', cluster: 'nutrients' },
    { kind: 'text', key: 'product.specs.dimensions', labelKey: 'admin.homepage.fields.product.specDimensions', group: 'specs', cluster: 'dimensions' },
    { kind: 'text', key: 'product.specs.dimensionsValue', labelKey: 'admin.homepage.fields.product.specDimensionsValue', group: 'specs', cluster: 'dimensions' },
    { kind: 'image', key: 'product.main', labelKey: 'admin.homepage.fields.product.image', group: 'photo', defaultUrl: lifestyleImages.kitchenBasil },
  ],
  howItWorks: [
    { kind: 'text', key: 'howItWorks.eyebrow', labelKey: 'admin.homepage.fields.howItWorks.eyebrow', group: 'heading' },
    { kind: 'text', key: 'howItWorks.title', labelKey: 'admin.homepage.fields.howItWorks.title', group: 'heading' },
    { kind: 'text', key: 'howItWorks.subtitle', labelKey: 'admin.homepage.fields.howItWorks.subtitle', group: 'heading' },
    { kind: 'text', key: 'howItWorks.steps.placeCapsule.title', labelKey: 'admin.homepage.fields.howItWorks.step1Title', group: 'steps', cluster: '1' },
    { kind: 'textarea', key: 'howItWorks.steps.placeCapsule.description', labelKey: 'admin.homepage.fields.howItWorks.step1Desc', group: 'steps', cluster: '1' },
    { kind: 'text', key: 'howItWorks.steps.addSolution.title', labelKey: 'admin.homepage.fields.howItWorks.step2Title', group: 'steps', cluster: '2' },
    { kind: 'textarea', key: 'howItWorks.steps.addSolution.description', labelKey: 'admin.homepage.fields.howItWorks.step2Desc', group: 'steps', cluster: '2' },
    { kind: 'text', key: 'howItWorks.steps.turnOn.title', labelKey: 'admin.homepage.fields.howItWorks.step3Title', group: 'steps', cluster: '3' },
    { kind: 'textarea', key: 'howItWorks.steps.turnOn.description', labelKey: 'admin.homepage.fields.howItWorks.step3Desc', group: 'steps', cluster: '3' },
    { kind: 'text', key: 'howItWorks.steps.harvest.title', labelKey: 'admin.homepage.fields.howItWorks.step4Title', group: 'steps', cluster: '4' },
    { kind: 'textarea', key: 'howItWorks.steps.harvest.description', labelKey: 'admin.homepage.fields.howItWorks.step4Desc', group: 'steps', cluster: '4' },
  ],
  lightCycle: [
    { kind: 'text', key: 'lightCycle.eyebrow', labelKey: 'admin.homepage.fields.lightCycle.eyebrow', group: 'heading' },
    { kind: 'text', key: 'lightCycle.title', labelKey: 'admin.homepage.fields.lightCycle.title', group: 'heading' },
    { kind: 'textarea', key: 'lightCycle.description', labelKey: 'admin.homepage.fields.lightCycle.description', group: 'heading' },
    { kind: 'text', key: 'lightCycle.onLabel', labelKey: 'admin.homepage.fields.lightCycle.onLabel', group: 'cycle', cluster: 'on' },
    { kind: 'textarea', key: 'lightCycle.onDescription', labelKey: 'admin.homepage.fields.lightCycle.onDesc', group: 'cycle', cluster: 'on' },
    { kind: 'text', key: 'lightCycle.offLabel', labelKey: 'admin.homepage.fields.lightCycle.offLabel', group: 'cycle', cluster: 'off' },
    { kind: 'textarea', key: 'lightCycle.offDescription', labelKey: 'admin.homepage.fields.lightCycle.offDesc', group: 'cycle', cluster: 'off' },
    { kind: 'text', key: 'lightCycle.diagramLabel', labelKey: 'admin.homepage.fields.lightCycle.diagramLabel', group: 'days' },
    { kind: 'text', key: 'lightCycle.days.0', labelKey: 'admin.homepage.fields.lightCycle.dayMon', group: 'days' },
    { kind: 'text', key: 'lightCycle.days.1', labelKey: 'admin.homepage.fields.lightCycle.dayTue', group: 'days' },
    { kind: 'text', key: 'lightCycle.days.2', labelKey: 'admin.homepage.fields.lightCycle.dayWed', group: 'days' },
    { kind: 'text', key: 'lightCycle.days.3', labelKey: 'admin.homepage.fields.lightCycle.dayThu', group: 'days' },
  ],
  podsGrid: [
    { kind: 'text', key: 'podsSection.eyebrow', labelKey: 'admin.homepage.fields.podsGrid.eyebrow', group: 'heading' },
    { kind: 'text', key: 'podsSection.title', labelKey: 'admin.homepage.fields.podsGrid.title', group: 'heading' },
    { kind: 'textarea', key: 'podsSection.subtitle', labelKey: 'admin.homepage.fields.podsGrid.subtitle', group: 'heading' },
  ],
  socialProof: [
    { kind: 'text', key: 'socialProof.subtitle', labelKey: 'admin.homepage.fields.socialProof.subtitle', group: 'heading' },
    { kind: 'text', key: 'socialProof.stat', labelKey: 'admin.homepage.fields.socialProof.stat', group: 'heading' },
    { kind: 'text', key: 'socialProof.statLabel', labelKey: 'admin.homepage.fields.socialProof.statLabel', group: 'heading' },
    { kind: 'textarea', key: 'socialProof.reviews.elena', labelKey: 'admin.homepage.fields.socialProof.reviewElena', group: 'reviews', cluster: 'elena' },
    { kind: 'text', key: 'community.handles.elena', labelKey: 'admin.homepage.fields.socialProof.handleElena', group: 'reviews', cluster: 'elena' },
    { kind: 'image', key: 'socialProof.elena', labelKey: 'admin.homepage.fields.socialProof.imageElena', group: 'reviews', cluster: 'elena', defaultUrl: socialProofImages.elena },
    { kind: 'textarea', key: 'socialProof.reviews.urbanherbs', labelKey: 'admin.homepage.fields.socialProof.reviewUrban', group: 'reviews', cluster: 'urban' },
    { kind: 'text', key: 'community.handles.urbanherbs', labelKey: 'admin.homepage.fields.socialProof.handleUrban', group: 'reviews', cluster: 'urban' },
    { kind: 'image', key: 'socialProof.urbanherbs', labelKey: 'admin.homepage.fields.socialProof.imageUrban', group: 'reviews', cluster: 'urban', defaultUrl: socialProofImages.urbanherbs },
    { kind: 'textarea', key: 'socialProof.reviews.freshplate', labelKey: 'admin.homepage.fields.socialProof.reviewFresh', group: 'reviews', cluster: 'fresh' },
    { kind: 'text', key: 'community.handles.freshplate', labelKey: 'admin.homepage.fields.socialProof.handleFresh', group: 'reviews', cluster: 'fresh' },
    { kind: 'image', key: 'socialProof.freshplate', labelKey: 'admin.homepage.fields.socialProof.imageFresh', group: 'reviews', cluster: 'fresh', defaultUrl: socialProofImages.freshplate },
  ],
  guarantees: [
    { kind: 'text', key: 'guarantees.title', labelKey: 'admin.homepage.fields.guarantees.title', group: 'heading' },
    { kind: 'text', key: 'guarantees.items.sprouting.title', labelKey: 'admin.homepage.fields.guarantees.sproutingTitle', group: 'items', cluster: 'sprouting' },
    { kind: 'textarea', key: 'guarantees.items.sprouting.description', labelKey: 'admin.homepage.fields.guarantees.sproutingDesc', group: 'items', cluster: 'sprouting' },
    { kind: 'text', key: 'guarantees.items.yearRound.title', labelKey: 'admin.homepage.fields.guarantees.yearRoundTitle', group: 'items', cluster: 'yearRound' },
    { kind: 'textarea', key: 'guarantees.items.yearRound.description', labelKey: 'admin.homepage.fields.guarantees.yearRoundDesc', group: 'items', cluster: 'yearRound' },
    { kind: 'text', key: 'guarantees.items.support.title', labelKey: 'admin.homepage.fields.guarantees.supportTitle', group: 'items', cluster: 'support' },
    { kind: 'textarea', key: 'guarantees.items.support.description', labelKey: 'admin.homepage.fields.guarantees.supportDesc', group: 'items', cluster: 'support' },
    { kind: 'text', key: 'guarantees.items.sustainable.title', labelKey: 'admin.homepage.fields.guarantees.sustainableTitle', group: 'items', cluster: 'sustainable' },
    { kind: 'textarea', key: 'guarantees.items.sustainable.description', labelKey: 'admin.homepage.fields.guarantees.sustainableDesc', group: 'items', cluster: 'sustainable' },
  ],
  accessories: [
    { kind: 'text', key: 'accessoriesSection.title', labelKey: 'admin.homepage.fields.accessories.title', group: 'heading' },
    { kind: 'textarea', key: 'accessoriesSection.subtitle', labelKey: 'admin.homepage.fields.accessories.subtitle', group: 'heading' },
  ],
  cta: [
    { kind: 'text', key: 'cta.title', labelKey: 'admin.homepage.fields.cta.title', group: 'heading' },
    { kind: 'textarea', key: 'cta.subtitle', labelKey: 'admin.homepage.fields.cta.subtitle', group: 'heading' },
    { kind: 'text', key: 'cta.emailPlaceholder', labelKey: 'admin.homepage.fields.cta.emailPlaceholder', group: 'form' },
    { kind: 'text', key: 'cta.button', labelKey: 'admin.homepage.fields.cta.button', group: 'form' },
    { kind: 'image', key: 'cta.main', labelKey: 'admin.homepage.fields.cta.image', group: 'photo', defaultUrl: lifestyleImages.mintKitchen },
  ],
}

export function getAllTextKeys(): string[] {
  const keys = new Set<string>()
  for (const fields of Object.values(homepageSectionsSchema)) {
    for (const field of fields) {
      if (field.kind !== 'image') keys.add(field.key)
    }
  }
  return [...keys]
}

export function getDefaultImages(): Record<string, string> {
  const images: Record<string, string> = {}
  for (const fields of Object.values(homepageSectionsSchema)) {
    for (const field of fields) {
      if (field.kind === 'image') images[field.key] = field.defaultUrl
    }
  }
  return images
}

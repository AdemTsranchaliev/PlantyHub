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

export type SchemaField =
  | { kind: 'text'; key: string; labelKey: string }
  | { kind: 'textarea'; key: string; labelKey: string }
  | { kind: 'image'; key: string; labelKey: string; defaultUrl: string }

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

export const homepageSectionsSchema: Record<HomepageSectionKey, SchemaField[]> = {
  hero: [
    { kind: 'text', key: 'hero.badge', labelKey: 'admin.homepage.fields.hero.badge' },
    { kind: 'text', key: 'hero.title', labelKey: 'admin.homepage.fields.hero.title' },
    { kind: 'text', key: 'hero.promise', labelKey: 'admin.homepage.fields.hero.promise' },
    { kind: 'textarea', key: 'hero.description', labelKey: 'admin.homepage.fields.hero.description' },
    { kind: 'text', key: 'hero.ctaPrimary', labelKey: 'admin.homepage.fields.hero.ctaPrimary' },
    { kind: 'text', key: 'hero.ctaSecondary', labelKey: 'admin.homepage.fields.hero.ctaSecondary' },
    { kind: 'text', key: 'hero.priceLabel', labelKey: 'admin.homepage.fields.hero.priceLabel' },
    { kind: 'text', key: 'hero.imageAlt', labelKey: 'admin.homepage.fields.hero.imageAlt' },
    { kind: 'text', key: 'hero.trust.shipping', labelKey: 'admin.homepage.fields.hero.trustShipping' },
    { kind: 'text', key: 'hero.stats.pods.value', labelKey: 'admin.homepage.fields.hero.statPodsValue' },
    { kind: 'text', key: 'hero.stats.pods.label', labelKey: 'admin.homepage.fields.hero.statPodsLabel' },
    { kind: 'text', key: 'hero.stats.light.value', labelKey: 'admin.homepage.fields.hero.statLightValue' },
    { kind: 'text', key: 'hero.stats.light.label', labelKey: 'admin.homepage.fields.hero.statLightLabel' },
    { kind: 'text', key: 'hero.stats.height.value', labelKey: 'admin.homepage.fields.hero.statHeightValue' },
    { kind: 'text', key: 'hero.stats.height.label', labelKey: 'admin.homepage.fields.hero.statHeightLabel' },
    { kind: 'image', key: 'hero.main', labelKey: 'admin.homepage.fields.hero.image', defaultUrl: stockImages.homeGardenProduct },
  ],
  growSmarter: [
    { kind: 'text', key: 'growSmarter.subtitle', labelKey: 'admin.homepage.fields.growSmarter.subtitle' },
    { kind: 'text', key: 'growSmarter.title', labelKey: 'admin.homepage.fields.growSmarter.title' },
    { kind: 'text', key: 'growSmarter.items.zero.title', labelKey: 'admin.homepage.fields.growSmarter.zeroTitle' },
    { kind: 'textarea', key: 'growSmarter.items.zero.description', labelKey: 'admin.homepage.fields.growSmarter.zeroDesc' },
    { kind: 'text', key: 'growSmarter.items.noSoil.title', labelKey: 'admin.homepage.fields.growSmarter.noSoilTitle' },
    { kind: 'textarea', key: 'growSmarter.items.noSoil.description', labelKey: 'admin.homepage.fields.growSmarter.noSoilDesc' },
    { kind: 'text', key: 'growSmarter.items.fresh.title', labelKey: 'admin.homepage.fields.growSmarter.freshTitle' },
    { kind: 'textarea', key: 'growSmarter.items.fresh.description', labelKey: 'admin.homepage.fields.growSmarter.freshDesc' },
    { kind: 'image', key: 'growSmarter.main', labelKey: 'admin.homepage.fields.growSmarter.image', defaultUrl: lifestyleImages.basilCloseup },
  ],
  product: [
    { kind: 'text', key: 'product.eyebrow', labelKey: 'admin.homepage.fields.product.eyebrow' },
    { kind: 'text', key: 'product.title', labelKey: 'admin.homepage.fields.product.title' },
    { kind: 'textarea', key: 'product.description', labelKey: 'admin.homepage.fields.product.description' },
    { kind: 'text', key: 'product.cta', labelKey: 'admin.homepage.fields.product.cta' },
    { kind: 'text', key: 'product.trust.shipping', labelKey: 'admin.homepage.fields.product.trustShipping' },
    { kind: 'text', key: 'product.trust.guarantee', labelKey: 'admin.homepage.fields.product.trustGuarantee' },
    { kind: 'text', key: 'product.trust.returns', labelKey: 'admin.homepage.fields.product.trustReturns' },
    { kind: 'text', key: 'product.specs.pods', labelKey: 'admin.homepage.fields.product.specPods' },
    { kind: 'text', key: 'product.specs.podsValue', labelKey: 'admin.homepage.fields.product.specPodsValue' },
    { kind: 'text', key: 'product.specs.light', labelKey: 'admin.homepage.fields.product.specLight' },
    { kind: 'text', key: 'product.specs.lightValue', labelKey: 'admin.homepage.fields.product.specLightValue' },
    { kind: 'text', key: 'product.specs.growthHeight', labelKey: 'admin.homepage.fields.product.specHeight' },
    { kind: 'text', key: 'product.specs.growthHeightValue', labelKey: 'admin.homepage.fields.product.specHeightValue' },
    { kind: 'text', key: 'product.specs.irrigation', labelKey: 'admin.homepage.fields.product.specIrrigation' },
    { kind: 'text', key: 'product.specs.irrigationValue', labelKey: 'admin.homepage.fields.product.specIrrigationValue' },
    { kind: 'text', key: 'product.specs.nutrients', labelKey: 'admin.homepage.fields.product.specNutrients' },
    { kind: 'text', key: 'product.specs.nutrientsValue', labelKey: 'admin.homepage.fields.product.specNutrientsValue' },
    { kind: 'text', key: 'product.specs.dimensions', labelKey: 'admin.homepage.fields.product.specDimensions' },
    { kind: 'text', key: 'product.specs.dimensionsValue', labelKey: 'admin.homepage.fields.product.specDimensionsValue' },
    { kind: 'image', key: 'product.main', labelKey: 'admin.homepage.fields.product.image', defaultUrl: lifestyleImages.kitchenBasil },
  ],
  howItWorks: [
    { kind: 'text', key: 'howItWorks.eyebrow', labelKey: 'admin.homepage.fields.howItWorks.eyebrow' },
    { kind: 'text', key: 'howItWorks.title', labelKey: 'admin.homepage.fields.howItWorks.title' },
    { kind: 'text', key: 'howItWorks.subtitle', labelKey: 'admin.homepage.fields.howItWorks.subtitle' },
    { kind: 'text', key: 'howItWorks.steps.placeCapsule.title', labelKey: 'admin.homepage.fields.howItWorks.step1Title' },
    { kind: 'textarea', key: 'howItWorks.steps.placeCapsule.description', labelKey: 'admin.homepage.fields.howItWorks.step1Desc' },
    { kind: 'text', key: 'howItWorks.steps.addSolution.title', labelKey: 'admin.homepage.fields.howItWorks.step2Title' },
    { kind: 'textarea', key: 'howItWorks.steps.addSolution.description', labelKey: 'admin.homepage.fields.howItWorks.step2Desc' },
    { kind: 'text', key: 'howItWorks.steps.turnOn.title', labelKey: 'admin.homepage.fields.howItWorks.step3Title' },
    { kind: 'textarea', key: 'howItWorks.steps.turnOn.description', labelKey: 'admin.homepage.fields.howItWorks.step3Desc' },
    { kind: 'text', key: 'howItWorks.steps.harvest.title', labelKey: 'admin.homepage.fields.howItWorks.step4Title' },
    { kind: 'textarea', key: 'howItWorks.steps.harvest.description', labelKey: 'admin.homepage.fields.howItWorks.step4Desc' },
  ],
  lightCycle: [
    { kind: 'text', key: 'lightCycle.eyebrow', labelKey: 'admin.homepage.fields.lightCycle.eyebrow' },
    { kind: 'text', key: 'lightCycle.title', labelKey: 'admin.homepage.fields.lightCycle.title' },
    { kind: 'textarea', key: 'lightCycle.description', labelKey: 'admin.homepage.fields.lightCycle.description' },
    { kind: 'text', key: 'lightCycle.onLabel', labelKey: 'admin.homepage.fields.lightCycle.onLabel' },
    { kind: 'textarea', key: 'lightCycle.onDescription', labelKey: 'admin.homepage.fields.lightCycle.onDesc' },
    { kind: 'text', key: 'lightCycle.offLabel', labelKey: 'admin.homepage.fields.lightCycle.offLabel' },
    { kind: 'textarea', key: 'lightCycle.offDescription', labelKey: 'admin.homepage.fields.lightCycle.offDesc' },
    { kind: 'text', key: 'lightCycle.diagramLabel', labelKey: 'admin.homepage.fields.lightCycle.diagramLabel' },
    { kind: 'text', key: 'lightCycle.days.0', labelKey: 'admin.homepage.fields.lightCycle.dayMon' },
    { kind: 'text', key: 'lightCycle.days.1', labelKey: 'admin.homepage.fields.lightCycle.dayTue' },
    { kind: 'text', key: 'lightCycle.days.2', labelKey: 'admin.homepage.fields.lightCycle.dayWed' },
    { kind: 'text', key: 'lightCycle.days.3', labelKey: 'admin.homepage.fields.lightCycle.dayThu' },
  ],
  podsGrid: [
    { kind: 'text', key: 'podsSection.eyebrow', labelKey: 'admin.homepage.fields.podsGrid.eyebrow' },
    { kind: 'text', key: 'podsSection.title', labelKey: 'admin.homepage.fields.podsGrid.title' },
    { kind: 'textarea', key: 'podsSection.subtitle', labelKey: 'admin.homepage.fields.podsGrid.subtitle' },
  ],
  socialProof: [
    { kind: 'text', key: 'socialProof.subtitle', labelKey: 'admin.homepage.fields.socialProof.subtitle' },
    { kind: 'text', key: 'socialProof.stat', labelKey: 'admin.homepage.fields.socialProof.stat' },
    { kind: 'text', key: 'socialProof.statLabel', labelKey: 'admin.homepage.fields.socialProof.statLabel' },
    { kind: 'textarea', key: 'socialProof.reviews.elena', labelKey: 'admin.homepage.fields.socialProof.reviewElena' },
    { kind: 'textarea', key: 'socialProof.reviews.urbanherbs', labelKey: 'admin.homepage.fields.socialProof.reviewUrban' },
    { kind: 'textarea', key: 'socialProof.reviews.freshplate', labelKey: 'admin.homepage.fields.socialProof.reviewFresh' },
    { kind: 'text', key: 'community.handles.elena', labelKey: 'admin.homepage.fields.socialProof.handleElena' },
    { kind: 'text', key: 'community.handles.urbanherbs', labelKey: 'admin.homepage.fields.socialProof.handleUrban' },
    { kind: 'text', key: 'community.handles.freshplate', labelKey: 'admin.homepage.fields.socialProof.handleFresh' },
    { kind: 'image', key: 'socialProof.elena', labelKey: 'admin.homepage.fields.socialProof.imageElena', defaultUrl: socialProofImages.elena },
    { kind: 'image', key: 'socialProof.urbanherbs', labelKey: 'admin.homepage.fields.socialProof.imageUrban', defaultUrl: socialProofImages.urbanherbs },
    { kind: 'image', key: 'socialProof.freshplate', labelKey: 'admin.homepage.fields.socialProof.imageFresh', defaultUrl: socialProofImages.freshplate },
  ],
  guarantees: [
    { kind: 'text', key: 'guarantees.title', labelKey: 'admin.homepage.fields.guarantees.title' },
    { kind: 'text', key: 'guarantees.items.sprouting.title', labelKey: 'admin.homepage.fields.guarantees.sproutingTitle' },
    { kind: 'textarea', key: 'guarantees.items.sprouting.description', labelKey: 'admin.homepage.fields.guarantees.sproutingDesc' },
    { kind: 'text', key: 'guarantees.items.yearRound.title', labelKey: 'admin.homepage.fields.guarantees.yearRoundTitle' },
    { kind: 'textarea', key: 'guarantees.items.yearRound.description', labelKey: 'admin.homepage.fields.guarantees.yearRoundDesc' },
    { kind: 'text', key: 'guarantees.items.support.title', labelKey: 'admin.homepage.fields.guarantees.supportTitle' },
    { kind: 'textarea', key: 'guarantees.items.support.description', labelKey: 'admin.homepage.fields.guarantees.supportDesc' },
    { kind: 'text', key: 'guarantees.items.sustainable.title', labelKey: 'admin.homepage.fields.guarantees.sustainableTitle' },
    { kind: 'textarea', key: 'guarantees.items.sustainable.description', labelKey: 'admin.homepage.fields.guarantees.sustainableDesc' },
  ],
  accessories: [
    { kind: 'text', key: 'accessoriesSection.title', labelKey: 'admin.homepage.fields.accessories.title' },
    { kind: 'textarea', key: 'accessoriesSection.subtitle', labelKey: 'admin.homepage.fields.accessories.subtitle' },
  ],
  cta: [
    { kind: 'text', key: 'cta.title', labelKey: 'admin.homepage.fields.cta.title' },
    { kind: 'textarea', key: 'cta.subtitle', labelKey: 'admin.homepage.fields.cta.subtitle' },
    { kind: 'text', key: 'cta.emailPlaceholder', labelKey: 'admin.homepage.fields.cta.emailPlaceholder' },
    { kind: 'text', key: 'cta.button', labelKey: 'admin.homepage.fields.cta.button' },
    { kind: 'image', key: 'cta.main', labelKey: 'admin.homepage.fields.cta.image', defaultUrl: lifestyleImages.mintKitchen },
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

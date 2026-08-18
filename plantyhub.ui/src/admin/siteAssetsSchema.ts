import { blogArticleIds, blogArticleImages } from '../data/catalog'
import { lifestyleImages } from '../data/images'

export type SiteAssetSlot = {
  key: string
  labelKey: string
  defaultUrl: string
}

export type SiteAssetGroup = {
  id: 'blog' | 'about' | 'pdp'
  labelKey: string
  slots: SiteAssetSlot[]
}

export const siteAssetGroups: SiteAssetGroup[] = [
  {
    id: 'blog',
    labelKey: 'admin.media.groups.blog',
    slots: blogArticleIds.map((id) => ({
      key: `blog.${id}`,
      labelKey: `admin.media.slots.blog.${id}`,
      defaultUrl: blogArticleImages[id],
    })),
  },
  {
    id: 'about',
    labelKey: 'admin.media.groups.about',
    slots: [
      {
        key: 'about.hero',
        labelKey: 'admin.media.slots.about.hero',
        defaultUrl: lifestyleImages.heroKitchen,
      },
    ],
  },
  {
    id: 'pdp',
    labelKey: 'admin.media.groups.pdp',
    slots: [
      {
        key: 'pdp.gallery.basilCloseup',
        labelKey: 'admin.media.slots.pdp.basilCloseup',
        defaultUrl: lifestyleImages.basilCloseup,
      },
      {
        key: 'pdp.gallery.kitchenBasil',
        labelKey: 'admin.media.slots.pdp.kitchenBasil',
        defaultUrl: lifestyleImages.kitchenBasil,
      },
      {
        key: 'pdp.gallery.homeGarden',
        labelKey: 'admin.media.slots.pdp.homeGarden',
        defaultUrl: lifestyleImages.homeGardenProduct,
      },
      {
        key: 'pdp.gallery.mintKitchen',
        labelKey: 'admin.media.slots.pdp.mintKitchen',
        defaultUrl: lifestyleImages.mintKitchen,
      },
      {
        key: 'pdp.gallery.heroKitchen',
        labelKey: 'admin.media.slots.pdp.heroKitchen',
        defaultUrl: lifestyleImages.heroKitchen,
      },
      {
        key: 'pdp.bonus.herbs',
        labelKey: 'admin.media.slots.pdp.bonusHerbs',
        defaultUrl: lifestyleImages.outdoorDeck,
      },
      {
        key: 'pdp.bonus.salad',
        labelKey: 'admin.media.slots.pdp.bonusSalad',
        defaultUrl: lifestyleImages.outdoorHerbs,
      },
      {
        key: 'pdp.bonus.aromatic',
        labelKey: 'admin.media.slots.pdp.bonusAromatic',
        defaultUrl: lifestyleImages.mintKitchen,
      },
      {
        key: 'pdp.bonus.chef',
        labelKey: 'admin.media.slots.pdp.bonusChef',
        defaultUrl: lifestyleImages.kitchenBasil,
      },
    ],
  },
]

export function getDefaultSiteAssets(): Record<string, string> {
  const images: Record<string, string> = {}
  for (const group of siteAssetGroups) {
    for (const slot of group.slots) {
      images[slot.key] = slot.defaultUrl
    }
  }
  return images
}

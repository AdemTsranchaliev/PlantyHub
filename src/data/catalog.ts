import { avatarPlaceholder, stockImages } from './images'
export const campaignBundleIds = ['herb-mix-12', 'basil', 'mint', 'arugula'] as const

export const campaignBundleCatalog: Record<
  (typeof campaignBundleIds)[number],
  { price: string; image: string; nameKey: string; packKey: string; imageFit?: 'cover' | 'contain' }
> = {
  'herb-mix-12': {
    price: '€19.99',
    image: stockImages.outdoorDeck,
    nameKey: 'herb-mix-12',
    packKey: 'pack12',
    imageFit: 'cover',
  },
  basil: { price: '€9.99', image: stockImages.basil, nameKey: 'basil', packKey: 'pack3', imageFit: 'contain' },
  mint: { price: '€9.99', image: stockImages.mint, nameKey: 'mint', packKey: 'pack3', imageFit: 'contain' },
  arugula: { price: '€9.99', image: stockImages.arugula, nameKey: 'arugula', packKey: 'pack3', imageFit: 'contain' },
}

export const navHrefs = {
  product: '/#product',
  howItWorks: '/#how-it-works',
  pods: '/pods',
  accessories: '/accessories',
  about: '/about',
  support: '/support',
  cta: '/#cta',
  /** dedicated product detail page */
  buy: '/homegarder-one',
  /** legacy anchors */
  gardens: '/#product',
  consumables: '/#pods',
  story: '/#how-it-works',
  press: '#',
} as const

/** Six homepage pod cards */
export const homepagePodIds = [
  'basil',
  'mint',
  'parsley',
  'cilantro',
  'dill',
  'arugula',
] as const

export const howItWorksStepIds = ['placeCapsule', 'addSolution', 'turnOn', 'harvest'] as const

export const productSpecRows = [
  { key: 'pods', valueKey: 'podsValue' },
  { key: 'light', valueKey: 'lightValue' },
  { key: 'growthHeight', valueKey: 'growthHeightValue' },
  { key: 'irrigation', valueKey: 'irrigationValue' },
  { key: 'nutrients', valueKey: 'nutrientsValue' },
  { key: 'dimensions', valueKey: 'dimensionsValue' },
] as const

export const socialProofReviewIds = ['elena', 'urbanherbs', 'freshplate'] as const

export const socialProofImages = {
  elena: stockImages.mintCloseup,
  urbanherbs: stockImages.basilCloseup,
  freshplate: stockImages.kitchenBasil,
} as const

/** Main garden products */
export const gardensCatalog = [
  {
    id: 'homegarder-one',
    price: '€99.00',
    colors: [{ id: 'white', hex: '#FFFFFF' }],
    image: stockImages.homeGardenProduct,
    imageFit: 'cover' as const,
    featured: true,
  },
  {
    id: 'starter-bundle',
    price: '€129.00',
    compareAt: '€148.90',
    colors: [{ id: 'white', hex: '#FFFFFF' }],
    image: stockImages.outdoorDeck,
    imageFit: 'cover' as const,
  },
  {
    id: 'pods-kit',
    price: '€39.90',
    colors: [{ id: 'default', hex: '#E8E5DA' }],
    image: stockImages.mintKitchen,
    imageFit: 'cover' as const,
  },
] as const

/** What's inside the starter bundle */
export const starterBundleItemKeys = [
  'homegarderOne',
  'seedPodsBox',
  'diyKit',
  'unifiedShipping',
] as const

export const starterBundleDetailKeys = [
  'basil',
  'mint',
  'parsley',
  'cilantro',
  'dill',
  'arugula',
  'emptyCapsules',
  'sanaAb',
  'germCaps',
  'instructions',
] as const

/** PlantyHub Pods — seed capsule refills (3-pack) */
export const seedPodsCatalog = [
  { id: 'basil', packKey: 'pack3', price: '€9.99', image: stockImages.basil, imageFit: 'contain' as const },
  { id: 'mint', packKey: 'pack3', price: '€9.99', image: stockImages.mint, imageFit: 'contain' as const },
  { id: 'parsley', packKey: 'pack3', price: '€9.99', image: stockImages.parsley, imageFit: 'contain' as const },
  { id: 'cilantro', packKey: 'pack3', price: '€9.99', image: stockImages.cilantro, imageFit: 'contain' as const },
  { id: 'dill', packKey: 'pack3', price: '€9.99', image: stockImages.dill, imageFit: 'contain' as const },
  { id: 'arugula', packKey: 'pack3', price: '€9.99', image: stockImages.arugula, imageFit: 'contain' as const },
  {
    id: 'herb-mix-12',
    packKey: 'pack12',
    price: '€19.99',
    image: stockImages.outdoorDeck,
    imageFit: 'cover' as const,
  },
] as const

/** Consumables — capsules, nutrients, germination caps */
export const consumablesCatalog = [
  {
    id: 'empty-capsules',
    packKey: 'pack12',
    price: '€5.90',
    image: stockImages.basilCloseup,
    imageFit: 'cover' as const,
  },
  {
    id: 'sana-ab',
    packKey: 'bottle2x100ml',
    price: '€8.90',
    image: stockImages.homeGardenProduct,
    imageFit: 'cover' as const,
  },
  {
    id: 'germination-caps',
    packKey: 'pack12',
    price: '€4.90',
    image: stockImages.mintCloseup,
    imageFit: 'cover' as const,
  },
] as const

export const accessoriesCatalog = [
  { id: 'storage-cabinet', price: '€24.90', image: stockImages.outdoorHerbs, imageFit: 'cover' as const },
  { id: 'wall-shelf', price: '€14.90', image: stockImages.kitchenBasil, imageFit: 'cover' as const },
  { id: 'herb-knife', price: '€6.90', image: stockImages.kitchenCaprese, imageFit: 'cover' as const },
] as const

export const growSmarterIds = ['zero', 'noSoil', 'fresh'] as const
export const guaranteeIds = ['sprouting', 'yearRound', 'support', 'sustainable'] as const

export const communityPostIds = [
  'elena',
  'urbanherbs',
  'freshplate',
  'gail',
  'homeinestonia',
  'mamaloves',
  'blogilates',
  'reese',
] as const

export const communityAvatars: Record<(typeof communityPostIds)[number], string> = {
  elena: avatarPlaceholder('Elena'),
  urbanherbs: avatarPlaceholder('Urban'),
  freshplate: avatarPlaceholder('Fresh'),
  gail: avatarPlaceholder('Gail'),
  homeinestonia: avatarPlaceholder('Estonia'),
  mamaloves: avatarPlaceholder('Mama'),
  blogilates: avatarPlaceholder('Blog'),
  reese: avatarPlaceholder('Reese'),
}

export const pressArticleIds = ['pesto', 'hydroponics', 'partnership', 'earthday'] as const

export const pressArticleImages = {
  pesto: stockImages.kitchenCaprese,
  hydroponics: stockImages.basilCloseup,
  partnership: stockImages.outdoorDeck,
  earthday: stockImages.outdoorHerbs,
} as const

export const homeGardenSpecKeys = ['pods', 'irrigation', 'lightCycle', 'qr'] as const

export const footerLinkKeys = {
  main: ['product', 'howItWorks', 'pods', 'accessories', 'about', 'support', 'contact', 'privacy'],
} as const

export const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/plantyhub.official', icon: 'instagram' },
  { label: 'TikTok', href: 'https://tiktok.com/@plantyhub.official', icon: 'tiktok' },
  { label: 'Facebook', href: 'https://facebook.com/plantyhub', icon: 'facebook' },
  { label: 'YouTube', href: 'https://youtube.com/@plantyhub', icon: 'youtube' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/plantyhub', icon: 'linkedin' },
] as const

export const campaignHeroImage = stockImages.heroKitchen
export const homeGardenImage = stockImages.homeGardenProduct
export const homeGardenPrice = '€99.00'
export const starterBundlePrice = '€129.00'
export const podsKitPrice = '€39.90'

export const heroPodThumbs = [
  { src: stockImages.basilCloseup, label: 'Basil' },
  { src: stockImages.mintCloseup, label: 'Mint' },
  { src: stockImages.arugula, label: 'Arugula' },
] as const

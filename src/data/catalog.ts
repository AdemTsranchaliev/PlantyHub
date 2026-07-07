import { avatarPlaceholder, stockImages } from './images'

export const campaignBundleIds = ['herb-mix', 'basil', 'tomato', 'mint'] as const

export const campaignBundleCatalog: Record<
  (typeof campaignBundleIds)[number],
  { price: string; image: string; nameKey: string; imageFit?: 'cover' | 'contain' }
> = {
  'herb-mix': { price: '€29.90', image: stockImages.kitchenBasil, nameKey: 'herb-mix', imageFit: 'cover' },
  basil: { price: '€12.90', image: stockImages.basilCloseup, nameKey: 'basil', imageFit: 'cover' },
  tomato: { price: '€13.90', image: stockImages.tomato, nameKey: 'tomato', imageFit: 'contain' },
  mint: { price: '€12.90', image: stockImages.mintKitchen, nameKey: 'mint', imageFit: 'cover' },
}

export const navHrefs = {
  gardens: '#gardens',
  pods: '#pods',
  accessories: '#accessories',
  support: '#support',
  story: '#story',
  press: '#press',
} as const

export const gardensCatalog = [
  {
    id: 'home-garden',
    price: '€199.00',
    colors: [{ id: 'white', hex: '#FFFFFF' }],
    image: stockImages.homeGardenProduct,
    imageFit: 'cover' as const,
    featured: true,
  },
  {
    id: 'starter-bundle',
    price: '€249.00',
    compareAt: '€293.00',
    colors: [{ id: 'white', hex: '#FFFFFF' }],
    image: stockImages.mintKitchen,
    imageFit: 'cover' as const,
  },
  {
    id: 'refill-kit',
    price: '€39.90',
    colors: [{ id: 'default', hex: '#E8E5DA' }],
    image: stockImages.kitchenBasil,
    imageFit: 'cover' as const,
  },
]

export const seedPodsCatalog = [
  { id: 'basil', packKey: 'pack3', price: '€12.90', image: stockImages.basil, imageFit: 'contain' as const },
  { id: 'mint', packKey: 'pack3', price: '€12.90', image: stockImages.mint, imageFit: 'contain' as const },
  { id: 'parsley', packKey: 'pack3', price: '€12.90', image: stockImages.parsley, imageFit: 'contain' as const },
  { id: 'dill', packKey: 'pack3', price: '€12.90', image: stockImages.dill, imageFit: 'contain' as const },
  { id: 'cilantro', packKey: 'pack3', price: '€12.90', image: stockImages.cilantro, imageFit: 'contain' as const },
  { id: 'green-onion', packKey: 'pack3', price: '€12.90', image: stockImages['green-onion'], imageFit: 'contain' as const },
  { id: 'arugula', packKey: 'pack3', price: '€11.90', image: stockImages.arugula, imageFit: 'contain' as const },
  { id: 'lettuce', packKey: 'pack3', price: '€11.90', image: stockImages.lettuce, imageFit: 'contain' as const },
  { id: 'spinach', packKey: 'pack3', price: '€11.90', image: stockImages.spinach, imageFit: 'contain' as const },
  { id: 'tomato', packKey: 'pack3', price: '€13.90', image: stockImages.tomato, imageFit: 'contain' as const },
  { id: 'herb-mix', packKey: 'pack9', price: '€29.90', image: stockImages.kitchenBasil, imageFit: 'cover' as const },
  { id: 'nutrients', packKey: 'bottle1L', price: '€17.90', image: stockImages.basilCloseup, imageFit: 'cover' as const },
] as const

export const featuredPodIds = ['basil', 'mint', 'tomato', 'cilantro', 'lettuce', 'parsley'] as const

export const accessoriesCatalog = [
  { id: 'nutrients', price: '€17.90', image: stockImages.basilCloseup },
  { id: 'spare-lid', price: '€14.90', image: stockImages.homeGardenProduct },
  { id: 'pod-tray', price: '€9.90', image: stockImages.outdoorHerbs },
]

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

export const homeGardenSpecKeys = ['pods', 'irrigation', 'led', 'qr'] as const

export const footerLinkKeys = {
  gardens: ['homeGarden', 'starterBundle', 'monthlyRefills', 'gardenSpecs'],
  pods: ['allPods', 'herbMix', 'nutrientMix', 'subscription'],
  shopLearn: ['quickstart', 'plantCare', 'shipping', 'payment'],
  company: ['ourStory', 'contact', 'support', 'privacy'],
} as const

export const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'Pinterest', href: 'https://pinterest.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
]

export const campaignHeroImage = stockImages.heroKitchen
export const homeGardenImage = stockImages.homeGardenProduct
export const homeGardenPrice = '€199.00'

export const heroPodThumbs = [
  { src: stockImages.basilCloseup, label: 'Basil' },
  { src: stockImages.mintCloseup, label: 'Mint' },
  { src: stockImages.kitchenBasil, label: 'Kitchen' },
] as const

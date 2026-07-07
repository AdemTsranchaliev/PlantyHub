import { placeholders } from './placeholders'

/** White-background pod product shots */
export const productImages = {
  basil: '/images/products/basil.png',
  mint: '/images/products/mint.png',
  lettuce: '/images/products/lettuce.png',
  spinach: '/images/products/spinach.png',
  tomato: '/images/products/tomato.png',
  cilantro: '/images/products/cilantro.png',
  'green-onion': '/images/products/green-onion.png',
  arugula: '/images/products/arugula.png',
  parsley: '/images/products/parsley.png',
  dill: '/images/products/dill.png',
} as const

export type ProductImageId = keyof typeof productImages

/** PlantyHub lifestyle & product photography */
export const lifestyleImages = {
  heroKitchen: '/images/lifestyle/hero-kitchen.png',
  homeGardenProduct: '/images/lifestyle/home-garden-product.png',
  kitchenBasil: '/images/lifestyle/kitchen-basil.png',
  kitchenCaprese: '/images/lifestyle/kitchen-caprese.png',
  mintKitchen: '/images/lifestyle/mint-kitchen.png',
  outdoorDeck: '/images/lifestyle/outdoor-deck.png',
  basilCloseup: '/images/lifestyle/basil-closeup.png',
  outdoorHerbs: '/images/lifestyle/outdoor-herbs.png',
  mintCloseup: '/images/lifestyle/mint-closeup.png',
} as const

/** Combined image map for catalog & sections */
export const stockImages = {
  ...productImages,
  ...lifestyleImages,
  // Aliases used across sections
  herbMix: lifestyleImages.kitchenBasil,
  indoorGarden: lifestyleImages.homeGardenProduct,
  gardenDevice: lifestyleImages.homeGardenProduct,
  herbsGrowing: lifestyleImages.kitchenBasil,
  hydroponic: lifestyleImages.basilCloseup,
  heroKitchen: lifestyleImages.heroKitchen,
  pesto: lifestyleImages.kitchenCaprese,
  accessories: lifestyleImages.outdoorDeck,
  tray: lifestyleImages.outdoorHerbs,
  strawberries: productImages.tomato,
} as const

export const logoSrc = '/logo.png'
export const logoIconSrc = '/logo-icon.png'

/** Vertical (9:16) product demo video — drop the file at this path in /public */
export const productVideo = '/videos/homegarder-one.mp4'
export const productVideoPoster = lifestyleImages.kitchenBasil

/** Community avatars — placeholders until real photos */
export const avatarPlaceholder = placeholders.avatar

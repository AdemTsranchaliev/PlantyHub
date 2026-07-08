import { placeholders } from './placeholders'
import { assetUrl } from '../paths'

/** White-background pod product shots */
export const productImages = {
  basil: assetUrl('/images/products/basil.png'),
  mint: assetUrl('/images/products/mint.png'),
  lettuce: assetUrl('/images/products/lettuce.png'),
  spinach: assetUrl('/images/products/spinach.png'),
  tomato: assetUrl('/images/products/tomato.png'),
  cilantro: assetUrl('/images/products/cilantro.png'),
  'green-onion': assetUrl('/images/products/green-onion.png'),
  arugula: assetUrl('/images/products/arugula.png'),
  parsley: assetUrl('/images/products/parsley.png'),
  dill: assetUrl('/images/products/dill.png'),
} as const

export type ProductImageId = keyof typeof productImages

/** PlantyHub lifestyle & product photography */
export const lifestyleImages = {
  heroKitchen: assetUrl('/images/lifestyle/hero-kitchen.png'),
  homeGardenProduct: assetUrl('/images/lifestyle/home-garden-product.png'),
  kitchenBasil: assetUrl('/images/lifestyle/kitchen-basil.png'),
  kitchenCaprese: assetUrl('/images/lifestyle/kitchen-caprese.png'),
  mintKitchen: assetUrl('/images/lifestyle/mint-kitchen.png'),
  outdoorDeck: assetUrl('/images/lifestyle/outdoor-deck.png'),
  basilCloseup: assetUrl('/images/lifestyle/basil-closeup.png'),
  outdoorHerbs: assetUrl('/images/lifestyle/outdoor-herbs.png'),
  mintCloseup: assetUrl('/images/lifestyle/mint-closeup.png'),
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

export const logoSrc = assetUrl('/logo.png')
export const logoIconSrc = assetUrl('/logo-icon.png')

/** Vertical (9:16) product demo video — drop the file at this path in /public */
export const productVideo = assetUrl('/videos/homegarder-one.mp4')
export const productVideoPoster = lifestyleImages.kitchenBasil

/** Community avatars — placeholders until real photos */
export const avatarPlaceholder = placeholders.avatar

import { useMemo, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import type { ResolvedProduct } from './useProducts'
import {
  addToCart as addToCartStore,
  clearCart,
  clearLastAdded,
  getCartState,
  removeFromCart,
  subscribeCart,
  updateCartQuantity,
  type CartItem,
} from '../store/cart'
import { calcShipping, formatEuro, parseEuro } from '../utils/price'

function useCartState() {
  return useSyncExternalStore(subscribeCart, getCartState, getCartState)
}

export function useCart() {
  const state = useCartState()

  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, item) => sum + parseEuro(item.price) * item.quantity, 0)
    const shipping = calcShipping(subtotal)
    const total = subtotal + shipping
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      subtotal,
      shipping,
      total,
      itemCount,
      subtotalLabel: formatEuro(subtotal),
      shippingLabel: formatEuro(shipping),
      totalLabel: formatEuro(total),
      freeShipping: shipping === 0,
    }
  }, [state.items])

  return {
    items: state.items,
    lastAddedAt: state.lastAddedAt,
    ...totals,
    addToCart: addToCartStore,
    updateQuantity: updateCartQuantity,
    removeItem: removeFromCart,
    clearCart,
    clearLastAdded,
  }
}

export function useAddProductToCart() {
  const { addToCart } = useCart()
  const { t } = useTranslation()

  return (category: CartItem['category'], product: ResolvedProduct, quantity = 1) => {
    addToCart({
      category,
      productId: product.id,
      quantity,
      name: product.name,
      price: product.price,
      image: product.image,
      imageFit: product.imageFit,
      pack: product.packKey ? t(`common.${product.packKey}`) : undefined,
    })
  }
}

import type { ProductCategory } from './products'

export type CartItem = {
  key: string
  category: ProductCategory
  productId: string
  quantity: number
  name: string
  price: string
  image: string
  imageFit?: 'cover' | 'contain'
  pack?: string
}

type CartState = {
  items: CartItem[]
  lastAddedAt: number
}

const STORAGE_KEY = 'plantyhub_cart'
const listeners = new Set<() => void>()

let cachedState: CartState | null = null

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readState(): CartState {
  if (cachedState) return cachedState

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CartState
      cachedState = { items: parsed.items ?? [], lastAddedAt: parsed.lastAddedAt ?? 0 }
      return cachedState
    }
  } catch {
    // fall through
  }

  cachedState = { items: [], lastAddedAt: 0 }
  return cachedState
}

function persist(state: CartState) {
  cachedState = state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  emit()
}

export function getCartState(): CartState {
  return readState()
}

export function cartItemKey(category: ProductCategory, productId: string) {
  return `${category}:${productId}`
}

export function addToCart(item: Omit<CartItem, 'key' | 'quantity'> & { quantity?: number }) {
  const state = readState()
  const key = cartItemKey(item.category, item.productId)
  const existing = state.items.find((i) => i.key === key)
  const quantity = item.quantity ?? 1

  const nextItem: CartItem = {
    key,
    category: item.category,
    productId: item.productId,
    quantity: existing ? Math.min(99, existing.quantity + quantity) : quantity,
    name: item.name,
    price: item.price,
    image: item.image,
    imageFit: item.imageFit,
    pack: item.pack,
  }

  const items = existing
    ? state.items.map((i) => (i.key === key ? nextItem : i))
    : [...state.items, nextItem]

  persist({ items, lastAddedAt: Date.now() })
}

export function updateCartQuantity(key: string, quantity: number) {
  const state = readState()
  if (quantity <= 0) {
    persist({ ...state, items: state.items.filter((i) => i.key !== key) })
    return
  }
  persist({
    ...state,
    items: state.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, quantity) } : i)),
  })
}

export function removeFromCart(key: string) {
  const state = readState()
  persist({ ...state, items: state.items.filter((i) => i.key !== key) })
}

export function clearCart() {
  persist({ items: [], lastAddedAt: 0 })
}

export function getCartCount() {
  return readState().items.reduce((sum, item) => sum + item.quantity, 0)
}

export function clearLastAdded() {
  const state = readState()
  if (!state.lastAddedAt) return
  persist({ ...state, lastAddedAt: 0 })
}

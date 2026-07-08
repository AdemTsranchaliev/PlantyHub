import type { CountryCode, OrderStatus } from '../admin/mockData'
import type { OrderAddress, OrderLineItem, PaymentMethod, Waybill } from '../admin/orderDetails'
import { buildOrderDetail, getOrderDetailById, type OrderDetail } from '../admin/orderDetails'
import { formatEuro, mockOrders } from '../admin/mockData'
import type { CartItem } from './cart'
import { calcShipping, parseEuro } from '../utils/price'

type OrderOverride = {
  status?: OrderStatus
  waybill?: Waybill
  timeline?: OrderDetail['timeline']
}

type OrdersState = Record<string, OrderOverride>

const STORAGE_KEY = 'plantyhub_orders'
const CUSTOMER_ORDERS_KEY = 'plantyhub_customer_orders'
const listeners = new Set<() => void>()

let cachedOrders: OrderDetail[] | null = null

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeOrders(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function invalidateCache() {
  cachedOrders = null
}

function readOverrides(): OrdersState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OrdersState) : {}
  } catch {
    return {}
  }
}

function writeOverrides(state: OrdersState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  invalidateCache()
  emit()
}

function mergeOrderDetail(base: OrderDetail, overrides: OrdersState): OrderDetail {
  const override = overrides[base.id]
  if (!override) return base

  const timeline =
    override.timeline ??
    (override.waybill || override.status
      ? [
          ...base.timeline,
          ...(override.waybill
            ? [
                {
                  at: override.waybill.createdAt,
                  status: 'shipped' as const,
                  note: `Waybill ${override.waybill.number}`,
                },
              ]
            : []),
        ]
      : base.timeline)

  return {
    ...base,
    status: override.status ?? (override.waybill ? 'shipped' : base.status),
    waybill: override.waybill ?? base.waybill,
    timeline,
  }
}

function readCustomerOrders(): OrderDetail[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_KEY)
    return raw ? (JSON.parse(raw) as OrderDetail[]) : []
  } catch {
    return []
  }
}

function writeCustomerOrders(orders: OrderDetail[]) {
  localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(orders))
  invalidateCache()
  emit()
}

function buildOrdersSnapshot(): OrderDetail[] {
  const overrides = readOverrides()
  const mock = mockOrders.map((o) => mergeOrderDetail(buildOrderDetail(o), overrides))
  const customer = readCustomerOrders().map((o) => mergeOrderDetail(o, overrides))
  return [...customer, ...mock]
}

export function getOrdersState(): OrderDetail[] {
  if (!cachedOrders) {
    cachedOrders = buildOrdersSnapshot()
  }
  return cachedOrders
}

/** @deprecated Use getOrdersState() */
export function getAllOrderDetails(): OrderDetail[] {
  return getOrdersState()
}

export function getOrderDetail(id: string): OrderDetail | undefined {
  return getOrdersState().find((o) => o.id === id)
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const overrides = readOverrides()
  const base = getOrderDetailById(id)
  const existing = overrides[id] ?? {}
  const timeline = [
    ...(existing.timeline ?? base?.timeline ?? []),
    { at: new Date().toISOString(), status, note: undefined },
  ]
  overrides[id] = { ...existing, status, timeline }
  writeOverrides(overrides)
}

export function createWaybill(
  id: string,
  data: Omit<Waybill, 'number' | 'createdAt'> & { number: string },
) {
  const overrides = readOverrides()
  const base = getOrderDetailById(id)
  const existing = overrides[id] ?? {}
  const waybill: Waybill = {
    ...data,
    createdAt: new Date().toISOString(),
  }
  const timeline = [
    ...(existing.timeline ?? base?.timeline ?? []),
    {
      at: waybill.createdAt,
      status: 'shipped' as const,
      note: `Waybill ${waybill.number}`,
    },
  ]
  overrides[id] = {
    ...existing,
    waybill,
    status: 'shipped',
    timeline,
  }
  writeOverrides(overrides)
}

export function resetOrdersState() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(CUSTOMER_ORDERS_KEY)
  invalidateCache()
  emit()
}

export type CheckoutInput = {
  name: string
  email: string
  phone: string
  street: string
  city: string
  postalCode: string
  country: CountryCode
  paymentMethod: PaymentMethod
  notes?: string
}

function buildLineItems(items: CartItem[]): OrderLineItem[] {
  return items.map((item, index) => {
    const unit = parseEuro(item.price)
    return {
      id: `li-${index + 1}`,
      productId: item.productId,
      nameKey: item.productId,
      name: item.name,
      categoryKey: item.category,
      quantity: item.quantity,
      unitPrice: item.price,
      total: formatEuro(unit * item.quantity),
      image: item.image,
    }
  })
}

function generateOrderId() {
  return `PH-${Date.now().toString().slice(-6)}`
}

export function createCustomerOrder(cartItems: CartItem[], checkout: CheckoutInput): OrderDetail {
  const subtotal = cartItems.reduce((sum, item) => sum + parseEuro(item.price) * item.quantity, 0)
  const shipping = calcShipping(subtotal)
  const total = subtotal + shipping
  const now = new Date()
  const address: OrderAddress = {
    name: checkout.name,
    phone: checkout.phone,
    street: checkout.street,
    city: checkout.city,
    postalCode: checkout.postalCode,
    country: checkout.country,
  }
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const id = generateOrderId()

  const order: OrderDetail = {
    id,
    customer: checkout.name,
    email: checkout.email,
    country: checkout.country,
    items: itemCount,
    total: formatEuro(total),
    status: 'pending',
    date: now.toISOString().slice(0, 10),
    customerId: `C-${checkout.email}`,
    phone: checkout.phone,
    lineItems: buildLineItems(cartItems),
    shipping: address,
    billing: address,
    paymentMethod: checkout.paymentMethod,
    subtotal: formatEuro(subtotal),
    shippingCost: formatEuro(shipping),
    tax: formatEuro(0),
    notes: checkout.notes,
    timeline: [{ at: now.toISOString(), status: 'pending', note: 'Order placed' }],
  }

  const existing = readCustomerOrders()
  writeCustomerOrders([order, ...existing])
  return order
}

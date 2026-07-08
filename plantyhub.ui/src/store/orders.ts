import type { CountryCode, OrderStatus } from '../admin/mockData'
import type { OrderDetail, Waybill } from '../admin/orderDetails'
import { mapOrderSummaryToDetail, ordersApi } from '../api'
import type { CheckoutPayload } from '../api/types'
import type { CartItem } from './cart'
import type { PaymentMethod } from '../admin/orderDetails'

const listeners = new Set<() => void>()
let cachedOrders: OrderDetail[] = []
let orderDetails = new Map<string, OrderDetail>()
let loading = false
let loadError: string | null = null

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeOrders(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getOrdersLoading() {
  return loading
}

export function getOrdersError() {
  return loadError
}

export function getOrdersState(): OrderDetail[] {
  return cachedOrders
}

export function getOrderDetail(id: string): OrderDetail | undefined {
  return orderDetails.get(id) ?? cachedOrders.find((o) => o.id === id)
}

export async function loadOrders(): Promise<OrderDetail[]> {
  loading = true
  loadError = null
  emit()
  try {
    const summaries = await ordersApi.getAdminAll()
    cachedOrders = summaries.map(mapOrderSummaryToDetail)
    emit()
    return cachedOrders
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load orders'
    emit()
    return cachedOrders
  } finally {
    loading = false
    emit()
  }
}

export async function fetchOrderDetail(id: string, admin = false): Promise<OrderDetail | undefined> {
  try {
    const detail = admin ? await ordersApi.getAdminById(id) : await ordersApi.getById(id)
    orderDetails.set(id, detail)
    const index = cachedOrders.findIndex((o) => o.id === id)
    if (index >= 0) cachedOrders[index] = detail
    emit()
    return detail
  } catch {
    return undefined
  }
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

export async function createCustomerOrder(cartItems: CartItem[], checkout: CheckoutInput): Promise<OrderDetail> {
  const payload: CheckoutPayload = {
    ...checkout,
    items: cartItems.map((item) => ({
      productId: item.productId,
      category: item.category,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    })),
  }
  const order = await ordersApi.checkout(payload)
  orderDetails.set(order.id, order)
  cachedOrders = [order, ...cachedOrders]
  emit()
  return order
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await ordersApi.updateStatus(id, status)
  orderDetails.set(id, order)
  cachedOrders = cachedOrders.map((o) => (o.id === id ? order : o))
  emit()
}

export async function createWaybill(
  id: string,
  data: Omit<Waybill, 'number' | 'createdAt'> & { number: string },
) {
  const order = await ordersApi.createWaybill(id, {
    number: data.number,
    courier: data.courier,
    weightKg: data.weightKg,
    packages: data.packages,
    codAmount: data.codAmount ? Number.parseFloat(data.codAmount.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined,
    notes: data.notes,
  })
  orderDetails.set(id, order)
  cachedOrders = cachedOrders.map((o) => (o.id === id ? order : o))
  emit()
}

export function resetOrdersState() {
  cachedOrders = []
  orderDetails.clear()
  emit()
}

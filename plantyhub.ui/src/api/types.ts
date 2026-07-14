import type { CountryCode, OrderStatus } from '../admin/mockData'
import type { CourierId, OrderDetail, PaymentMethod } from '../admin/orderDetails'
import type { HomepageState } from '../store/homepage'
import type { ProductCategory, ProductLocaleContent, ProductsState, StoredProduct } from '../store/products'

export type ApiProductDto = {
  id: string
  category: ProductCategory
  price: string
  compareAt?: string | null
  packKey?: string | null
  image: string
  imageFit: 'cover' | 'contain'
  featured: boolean
  active: boolean
  colors: { id: string; hex: string }[]
  locales: Record<string, ProductLocaleContent>
}

export type ApiProductsByCategory = {
  gardens: ApiProductDto[]
  pods: ApiProductDto[]
  consumables: ApiProductDto[]
  accessories: ApiProductDto[]
}

export type ApiOrderSummary = {
  id: string
  customer: string
  email: string
  country: CountryCode
  items: number
  total: string
  status: OrderStatus
  date: string
}

export type ApiOrderDetail = OrderDetail

export type ApiCustomer = {
  id: string
  name: string
  email: string
  phone: string
  country: CountryCode
  orders: number
  totalSpent: string
  joined: string
}

export type ApiCustomerDetail = {
  customer: ApiCustomer
  orders: ApiOrderSummary[]
}

export type ApiDashboard = {
  stats: {
    totalRevenue: number
    revenueTrend: number
    ordersThisMonth: number
    ordersTrend: number
    avgOrderValue: number
    avgOrderTrend: number
    conversionRate: number
    conversionTrend: number
    pendingOrders: number
    visitorsThisMonth: number
    newsletterSubscribers: number
  }
  weeklySales: { dayKey: string; amount: number }[]
  topProducts: { id: string; nameKey: string; categoryKey: string; sales: number; revenue: string }[]
}

export type ApiAuthResponse = {
  token: string
  email: string
  name: string
  roles: string[]
}

export type ApiRegisterResponse = {
  message: string
  email: string
  requiresEmailVerification: boolean
}

export type ApiMessageResponse = {
  message: string
}

export type ApiUserProfile = {
  email: string
  name: string
  roles: string[]
  emailConfirmed?: boolean
}

export type ApiNewsletterSubscriber = {
  email: string
  subscribedAt: string
  active: boolean
}

export type ApiHomepageState = HomepageState

export type ApiProductUpsert = {
  id: string
  category: ProductCategory
  price: string
  compareAt?: string
  packKey?: string
  image: string
  imageFit: 'cover' | 'contain'
  featured?: boolean
  active: boolean
  colors?: { id: string; hex: string }[]
  locales: Partial<Record<string, ProductLocaleContent>>
}

export function mapProductDto(dto: ApiProductDto): StoredProduct {
  return {
    id: dto.id,
    price: dto.price,
    compareAt: dto.compareAt ?? undefined,
    packKey: dto.packKey ?? undefined,
    image: dto.image,
    imageFit: dto.imageFit,
    featured: dto.featured,
    active: dto.active,
    colors: dto.colors?.length ? dto.colors : undefined,
    locales: dto.locales,
  }
}

export function mapProductsResponse(data: ApiProductsByCategory): ProductsState {
  return {
    gardens: data.gardens.map(mapProductDto),
    pods: data.pods.map(mapProductDto),
    consumables: data.consumables.map(mapProductDto),
    accessories: data.accessories.map(mapProductDto),
  }
}

export function toProductUpsert(product: StoredProduct, category: ProductCategory): ApiProductUpsert {
  return {
    id: product.id,
    category,
    price: product.price,
    compareAt: product.compareAt,
    packKey: product.packKey,
    image: product.image,
    imageFit: product.imageFit,
    featured: product.featured ?? false,
    active: product.active,
    colors: product.colors?.map((c) => ({ id: c.id, hex: c.hex })),
    locales: product.locales,
  }
}

export function mapOrderSummaryToDetail(summary: ApiOrderSummary): OrderDetail {
  return {
    ...summary,
    customerId: '',
    phone: '',
    lineItems: [],
    shipping: {
      name: summary.customer,
      phone: '',
      street: '',
      city: '',
      postalCode: '',
      country: summary.country,
    },
    billing: {
      name: summary.customer,
      phone: '',
      street: '',
      city: '',
      postalCode: '',
      country: summary.country,
    },
    paymentMethod: 'card' as PaymentMethod,
    subtotal: summary.total,
    shippingCost: '€0.00',
    tax: '€0.00',
    timeline: [{ at: `${summary.date}T12:00:00.000Z`, status: summary.status }],
  }
}

export type CheckoutPayload = {
  name: string
  email: string
  phone: string
  street: string
  city: string
  postalCode: string
  country: CountryCode
  paymentMethod: PaymentMethod
  notes?: string
  items: {
    productId: string
    category: ProductCategory
    name: string
    quantity: number
    price: string
    image: string
  }[]
}

export type CreateWaybillPayload = {
  number: string
  courier: CourierId
  weightKg: number
  packages: number
  codAmount?: number
  notes?: string
}

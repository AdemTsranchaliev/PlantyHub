import type { CountryCode, OrderStatus } from '../admin/mockData'
import type { CourierId, OrderDetail, PaymentMethod } from '../admin/orderDetails'
import type { HomepageState } from '../store/homepage'
import type { GrowingDifficulty, ProductCategory, ProductLocaleContent, ProductsState, StoredProduct } from '../store/products'

export type ApiProductDto = {
  id: string
  category: ProductCategory
  price: string
  compareAt?: string | null
  packKey?: string | null
  image: string
  imageFit: 'cover' | 'contain'
  gallery?: string[]
  videoUrl?: string | null
  videoPoster?: string | null
  kit?: { pods: number; caps: number; nutrientMl: number } | null
  growingDifficulty?: GrowingDifficulty | null
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
  courier?: string | null
  waybillNumber?: string | null
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

export type ApiMediaUpload = {
  url: string
  key: string
}

export type ApiSiteAssets = {
  images: Record<string, string>
}

export type ApiEmailTemplateSummary = {
  key: string
  name: string
  description: string
  subject: string
  updatedAt: string
}

export type ApiEmailTemplateDetail = {
  key: string
  name: string
  description: string
  subject: string
  htmlBody: string
  sampleData: Record<string, string>
  updatedAt: string
}

export type ApiEmailPreview = {
  subject: string
  html: string
}

export type ApiNewsletterSendResult = {
  sent: number
  failed: number
  errors: string[]
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
  gallery?: string[]
  videoUrl?: string
  videoPoster?: string
  kit?: { pods: number; caps: number; nutrientMl: number }
  growingDifficulty?: GrowingDifficulty
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
    gallery: dto.gallery?.length ? dto.gallery : undefined,
    videoUrl: dto.videoUrl || undefined,
    videoPoster: dto.videoPoster || undefined,
    kit: dto.kit && (dto.kit.pods || dto.kit.caps || dto.kit.nutrientMl) ? dto.kit : undefined,
    growingDifficulty: dto.growingDifficulty ?? undefined,
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
    image: product.gallery?.[0] || product.image,
    imageFit: product.imageFit,
    gallery: product.gallery,
    videoUrl: product.videoUrl,
    videoPoster: product.videoPoster,
    kit: product.kit,
    growingDifficulty: category === 'pods' ? product.growingDifficulty : undefined,
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
  courier?: string
  delivery?: string
  officeCode?: string
  cityId?: string
  promoCode?: string
  termsAccepted: boolean
  items: {
    productId: string
    category: ProductCategory
    name: string
    quantity: number
    price: string
    image: string
    giftName?: string
    giftImage?: string
    giftCompareAt?: string
  }[]
}

export type ShippingQuote = {
  id: string
  courier: string
  delivery: string
  officeCode?: string | null
  price: number
  currency: string
  priceEur: number
  message?: string | null
}

export type ShippingQuotesResponse = {
  quotes: ShippingQuote[]
}

export type CreateWaybillPayload = {
  courier: CourierId
  weightKg: number
  packages: number
  codAmount?: number
  notes?: string
  payer?: 'customer' | 'merchant'
}

export type CourierIdKey = 'econt' | 'speedy' | 'dhl' | 'boxnow'

export type ApiCourierSender = {
  company: string
  contactName: string
  phone: string
  email: string
  street: string
  city: string
  postalCode: string
  country: string
  defaultCourier: CourierIdKey | string
}

export type ApiCourierAccount = {
  id: CourierIdKey
  enabled: boolean
  testMode: boolean
  configured: boolean
  mode: 'manual' | 'sandbox' | 'live' | string
  hasPassword: boolean
  username: string
  siteId: string
  apiUrl: string
  officeCode: string
  clientId: string
  contractId: string
  accountNumber: string
  iban: string
  serviceType: string
  contents: string
  payer: string
  defaultWeightKg: number
  defaultPackages: number
  labelFormat: string
  notes: string
  countryCode: string
  cityId: string
  cityName: string
}

export type ApiCourierSettings = {
  sender: ApiCourierSender
  econt: ApiCourierAccount
  speedy: ApiCourierAccount
  dhl: ApiCourierAccount
  boxnow: ApiCourierAccount
}

export type UpdateCourierAccountPayload = {
  enabled: boolean
  testMode: boolean
  username?: string
  password?: string
  siteId?: string
  apiUrl?: string
  officeCode?: string
  clientId?: string
  contractId?: string
  accountNumber?: string
  iban?: string
  serviceType?: string
  contents?: string
  payer?: string
  defaultWeightKg?: number
  defaultPackages?: number
  labelFormat?: string
  notes?: string
  countryCode?: string
  cityId?: string
  cityName?: string
}

export type CourierPlace = {
  id: string
  code: string
  name: string
  nameEn?: string | null
}

export type CourierOfficePlace = {
  id: string
  code: string
  name: string
  nameEn?: string | null
  cityId?: string | null
  cityName?: string | null
  address?: string | null
}

export type CourierLocationList = {
  source: string
  cachedAt?: string | null
  message?: string | null
  items: CourierPlace[]
}

export type CourierOfficeList = {
  source: string
  cachedAt?: string | null
  message?: string | null
  items: CourierOfficePlace[]
}

export type StoreVatRate = {
  country: string
  ratePercent: number
}

export type StoreVatSettings = {
  enabled: boolean
  pricesIncludeVat: boolean
  vatNumber: string
  homeCountry?: string
  rates: StoreVatRate[]
}

export type VatQuote = {
  enabled: boolean
  country: string
  ratePercent: number
  pricesIncludeVat: boolean
  tax: number
  total: number
  message?: string | null
}

export type AccountingVatCountry = {
  country: string
  countryName: string
  ratePercent: number
  orders: number
  net: number
  vat: number
  gross: number
}

export type AccountingReportPreview = {
  from: string
  to: string
  vatNumber: string
  orderCount: number
  cancelledExcluded: number
  products: number
  shipping: number
  net: number
  vat: number
  gross: number
  byCountry: AccountingVatCountry[]
}

export type EcontCheckIssue = {
  code: string
  severity: 'error' | 'warning' | string
  message?: string | null
}

export type EcontCheckResult = {
  ok: boolean
  cod: boolean
  codAmount?: string | null
  issues: EcontCheckIssue[]
  price?: number | null
  currency?: string | null
}

export type EcontStatusEvent = {
  time: string
  event: string
  place?: string | null
}

export type EcontStatusResult = {
  order: ApiOrderDetail
  courier: {
    status: string
    statusEn?: string | null
    events: EcontStatusEvent[]
  }
}

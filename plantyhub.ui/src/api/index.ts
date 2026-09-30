import { apiRequest, apiUpload, apiDownload, apiForm } from './client'
import { getCustomerToken } from '../auth/session'
import type {
  ApiAuthResponse,
  ApiCustomer,
  ApiCustomerDetail,
  ApiDashboard,
  ApiEmailPreview,
  ApiEmailTemplateDetail,
  ApiEmailTemplateSummary,
  ApiHomepageState,
  ApiMediaUpload,
  ApiMessageResponse,
  ApiNewsletterSendResult,
  ApiNewsletterSubscriber,
  ApiOrderDetail,
  ApiOrderSummary,
  ApiProductUpsert,
  ApiProductsByCategory,
  ApiRegisterResponse,
  ApiSiteAssets,
  ApiUserProfile,
  CheckoutPayload,
  CreateWaybillPayload,
  ApiCourierSettings,
  ApiCourierSender,
  UpdateCourierAccountPayload,
  CourierLocationList,
  CourierOfficeList,
  ShippingQuotesResponse,
  VatQuote,
  StoreVatSettings,
  AccountingReportPreview,
  EcontCheckResult,
  EcontStatusResult,
} from './types'
import type { OrderStatus } from '../admin/mockData'
import type { HomepageState } from '../store/homepage'

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiRequest<ApiRegisterResponse>('/api/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string; rememberMe?: boolean }) =>
    apiRequest<ApiAuthResponse>('/api/auth/login', { method: 'POST', body }),
  forgotPassword: (email: string) =>
    apiRequest<ApiMessageResponse>('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (body: { email: string; token: string; newPassword: string }) =>
    apiRequest<ApiMessageResponse>('/api/auth/reset-password', { method: 'POST', body }),
  verifyEmail: (body: { userId: string; token: string }) =>
    apiRequest<ApiMessageResponse>('/api/auth/verify-email', { method: 'POST', body }),
  resendVerification: (email: string) =>
    apiRequest<ApiMessageResponse>('/api/auth/resend-verification', { method: 'POST', body: { email } }),
  me: () => apiRequest<ApiUserProfile>('/api/auth/me', { auth: 'customer' }),
}

export const productsApi = {
  getPublic: () => apiRequest<ApiProductsByCategory>('/api/products'),
  getAdmin: () => apiRequest<ApiProductsByCategory>('/api/admin/products', { auth: 'admin' }),
  create: (body: ApiProductUpsert) =>
    apiRequest('/api/admin/products', { method: 'POST', body, auth: 'admin' }),
  update: (slug: string, body: ApiProductUpsert) =>
    apiRequest(`/api/admin/products/${slug}`, { method: 'PUT', body, auth: 'admin' }),
  setActive: (slug: string, active: boolean) =>
    apiRequest(`/api/admin/products/${slug}/active`, { method: 'PATCH', body: { active }, auth: 'admin' }),
  delete: (slug: string) =>
    apiRequest(`/api/admin/products/${slug}`, { method: 'DELETE', auth: 'admin' }),
}

export const ordersApi = {
  checkout: (body: CheckoutPayload) =>
    apiRequest<ApiOrderDetail>('/api/orders', {
      method: 'POST',
      body,
      auth: getCustomerToken() ? 'customer' : 'none',
    }),
  getById: (id: string, customerAuth = false) =>
    apiRequest<ApiOrderDetail>(`/api/orders/${id}`, { auth: customerAuth ? 'customer' : 'none' }),
  getMy: () => apiRequest<ApiOrderSummary[]>('/api/orders/my', { auth: 'customer' }),
  getAdminAll: () => apiRequest<ApiOrderSummary[]>('/api/admin/orders', { auth: 'admin' }),
  getAdminById: (id: string) => apiRequest<ApiOrderDetail>(`/api/admin/orders/${id}`, { auth: 'admin' }),
  updateStatus: (id: string, status: OrderStatus, note: string) =>
    apiRequest<ApiOrderDetail>(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status, note }, auth: 'admin' }),
  createWaybill: (id: string, body: CreateWaybillPayload) =>
    apiRequest<ApiOrderDetail>(`/api/admin/orders/${id}/waybill`, { method: 'POST', body, auth: 'admin' }),
  checkEcont: (id: string, body: { courier?: string; weightKg?: number; packages?: number }) =>
    apiRequest<EcontCheckResult>(`/api/admin/orders/${id}/econt/check`, { method: 'POST', body, auth: 'admin' }),
  refreshEcontStatus: (id: string, number?: string) =>
    apiRequest<EcontStatusResult>(
      `/api/admin/orders/${id}/econt/status${number ? `?number=${encodeURIComponent(number)}` : ''}`,
      { method: 'POST', auth: 'admin' },
    ),
  cancel: (id: string) => apiRequest<ApiOrderDetail>(`/api/admin/orders/${id}/cancel`, { method: 'POST', auth: 'admin' }),
}

export const customersApi = {
  getAll: () => apiRequest<ApiCustomer[]>('/api/admin/customers', { auth: 'admin' }),
  getById: (id: string) => apiRequest<ApiCustomerDetail>(`/api/admin/customers/${id}`, { auth: 'admin' }),
}

export const dashboardApi = {
  get: () => apiRequest<ApiDashboard>('/api/admin/dashboard', { auth: 'admin' }),
}

export const contactApi = {
  sendInquiry: (body: {
    name: string
    email: string
    subject: string
    message: string
    orderNumber?: string
  }) => apiRequest<{ message: string }>('/api/contact', { method: 'POST', body }),
}

export const newsletterApi = {
  subscribe: (email: string) => apiRequest('/api/newsletter/subscribe', { method: 'POST', body: { email } }),
  getStats: () => apiRequest<{ totalSubscribers: number }>('/api/admin/newsletter/stats', { auth: 'admin' }),
  getSubscribers: () => apiRequest<ApiNewsletterSubscriber[]>('/api/admin/newsletter/subscribers', { auth: 'admin' }),
  deleteSubscriber: (email: string) =>
    apiRequest(`/api/admin/newsletter/subscribers/${encodeURIComponent(email)}`, { method: 'DELETE', auth: 'admin' }),
  unsubscribeSubscriber: (email: string) =>
    apiRequest(`/api/admin/newsletter/subscribers/${encodeURIComponent(email)}/unsubscribe`, {
      method: 'POST',
      auth: 'admin',
    }),
  sendCampaign: (body: { subject?: string; htmlBody?: string; headline?: string; ctaUrl?: string }) =>
    apiRequest<ApiNewsletterSendResult>('/api/admin/newsletter/send', { method: 'POST', body, auth: 'admin' }),
}

export const emailTemplatesApi = {
  list: () => apiRequest<ApiEmailTemplateSummary[]>('/api/admin/email-templates', { auth: 'admin' }),
  get: (key: string) => apiRequest<ApiEmailTemplateDetail>(`/api/admin/email-templates/${key}`, { auth: 'admin' }),
  update: (
    key: string,
    body: {
      name?: string
      description?: string
      subject?: string
      htmlBody?: string
      sampleData?: Record<string, string>
    },
  ) => apiRequest<ApiEmailTemplateDetail>(`/api/admin/email-templates/${key}`, { method: 'PUT', body, auth: 'admin' }),
  preview: (key: string, variables?: Record<string, string>) =>
    apiRequest<ApiEmailPreview>(`/api/admin/email-templates/${key}/preview`, {
      method: 'POST',
      body: { variables },
      auth: 'admin',
    }),
  sendTest: (key: string, email: string, variables?: Record<string, string>) =>
    apiRequest<ApiMessageResponse>(`/api/admin/email-templates/${key}/send-test`, {
      method: 'POST',
      body: { email, variables },
      auth: 'admin',
    }),
}

export const homepageApi = {
  get: () => apiRequest<ApiHomepageState>('/api/homepage'),
  update: (body: Partial<HomepageState>) => apiRequest<ApiHomepageState>('/api/homepage', { method: 'PUT', body, auth: 'admin' }),
  reset: () => apiRequest<ApiHomepageState>('/api/homepage/reset', { method: 'POST', auth: 'admin' }),
}

export type PromoUse = {
  orderId: string
  customerName: string
  discount: number
  createdAt: string
}

export type PromoCode = {
  id: string
  code: string
  type: 'percent' | 'fixed'
  amount: number
  minSubtotal?: number | null
  usageLimit?: number | null
  usedCount: number
  startsAt?: string | null
  expiresAt?: string | null
  active: boolean
  uses?: PromoUse[]
}

export type PromoQuote = {
  code: string
  type: 'percent' | 'fixed'
  amount: number
  discount: number
}

export const promoApi = {
  list: () => apiRequest<PromoCode[]>('/api/promo-codes', { auth: 'admin' }),
  create: (body: Omit<PromoCode, 'id' | 'usedCount' | 'uses'>) =>
    apiRequest<PromoCode>('/api/promo-codes', { method: 'POST', body, auth: 'admin' }),
  update: (id: string, body: Omit<PromoCode, 'id' | 'usedCount' | 'uses'>) =>
    apiRequest<PromoCode>(`/api/promo-codes/${id}`, { method: 'PUT', body, auth: 'admin' }),
  remove: (id: string) => apiRequest<void>(`/api/promo-codes/${id}`, { method: 'DELETE', auth: 'admin' }),
  validate: (code: string, subtotal: number) =>
    apiRequest<PromoQuote>('/api/promo-codes/validate', { method: 'POST', body: { code, subtotal } }),
}

export const mediaApi = {
  upload: (file: File) => apiUpload<ApiMediaUpload>('/api/admin/media/upload', file, 'admin'),
}

export const siteAssetsApi = {
  get: () => apiRequest<ApiSiteAssets>('/api/site-assets'),
  update: (images: Record<string, string>) =>
    apiRequest<ApiSiteAssets>('/api/site-assets', { method: 'PUT', body: { images }, auth: 'admin' }),
}

export const shippingApi = {
  countries: (courier = 'econt', refresh = false) => {
    const q = new URLSearchParams({ courier })
    if (refresh) q.set('refresh', 'true')
    return apiRequest<CourierLocationList>(`/api/shipping/countries?${q}`)
  },
  cities: (courier: string, countryId: string, refresh = false) => {
    const q = new URLSearchParams({ courier, countryId })
    if (refresh) q.set('refresh', 'true')
    return apiRequest<CourierLocationList>(`/api/shipping/cities?${q}`)
  },
  offices: (
    courier: string,
    params: { countryId: string; cityId?: string; cityName?: string },
    refresh = false,
  ) => {
    const q = new URLSearchParams({ courier, countryId: params.countryId })
    if (params.cityId) q.set('cityId', params.cityId)
    if (params.cityName) q.set('cityName', params.cityName)
    if (refresh) q.set('refresh', 'true')
    return apiRequest<CourierOfficeList>(`/api/shipping/offices?${q}`)
  },
  quotes: (body: {
    country: string
    city: string
    cityId?: string
    postalCode: string
    street?: string
    officeCode?: string
    paymentMethod?: string
    subtotal?: number
    weightKg?: number
  }) => apiRequest<ShippingQuotesResponse>('/api/shipping/quotes', { method: 'POST', body }),
}

export const couriersApi = {
  get: () => apiRequest<ApiCourierSettings>('/api/admin/couriers', { auth: 'admin' }),
  update: (body: {
    sender?: ApiCourierSender
    econt?: UpdateCourierAccountPayload
    speedy?: UpdateCourierAccountPayload
    dhl?: UpdateCourierAccountPayload
    boxnow?: UpdateCourierAccountPayload
  }) => apiRequest<ApiCourierSettings>('/api/admin/couriers', { method: 'PUT', body, auth: 'admin' }),
  countries: (courier: string, refresh = false) =>
    apiRequest<CourierLocationList>(`/api/admin/couriers/${courier}/countries${refresh ? '?refresh=true' : ''}`, {
      auth: 'admin',
    }),
  cities: (courier: string, countryId: string, refresh = false) => {
    const q = new URLSearchParams({ countryId })
    if (refresh) q.set('refresh', 'true')
    return apiRequest<CourierLocationList>(`/api/admin/couriers/${courier}/cities?${q}`, { auth: 'admin' })
  },
  offices: (
    courier: string,
    params: { countryId: string; cityId?: string; cityName?: string },
    refresh = false,
  ) => {
    const q = new URLSearchParams({ countryId: params.countryId })
    if (params.cityId) q.set('cityId', params.cityId)
    if (params.cityName) q.set('cityName', params.cityName)
    if (refresh) q.set('refresh', 'true')
    return apiRequest<CourierOfficeList>(`/api/admin/couriers/${courier}/offices?${q}`, { auth: 'admin' })
  },
    calculate: (body: {
    country: string
    city: string
    cityId?: string
    postalCode: string
    street?: string
    officeCode?: string
    weightKg?: number
    courier?: string
  }) => apiRequest<ShippingQuotesResponse>('/api/admin/couriers/calculate', { method: 'POST', body, auth: 'admin' }),
}

export const taxApi = {
  quote: (country: string, subtotal: number, shipping = 0) => {
    const q = new URLSearchParams({
      country,
      subtotal: String(subtotal),
      shipping: String(shipping),
    })
    return apiRequest<VatQuote>(`/api/tax?${q}`)
  },
}

export const storeApi = {
  get: () => apiRequest<StoreVatSettings>('/api/admin/store', { auth: 'admin' }),
  update: (body: { enabled: boolean; pricesIncludeVat: boolean; vatNumber?: string }) =>
    apiRequest<StoreVatSettings>('/api/admin/store', { method: 'PUT', body, auth: 'admin' }),
}

export type AccountingReportKind = 'pack' | 'sales' | 'vat' | 'items'

export const reportsApi = {
  preview: (from: string, to: string, includeCancelled = false) => {
    const q = new URLSearchParams({ from, to, includeCancelled: String(includeCancelled) })
    return apiRequest<AccountingReportPreview>(`/api/admin/reports?${q}`, { auth: 'admin' })
  },
  download: (kind: AccountingReportKind, from: string, to: string, includeCancelled = false) => {
    const q = new URLSearchParams({ from, to, includeCancelled: String(includeCancelled) })
    return apiDownload(`/api/admin/reports/${kind}?${q}`, 'admin')
  },
}

export type ReviewStatus = 'pending' | 'published' | 'hidden'

export type AdminReview = {
  id: string
  productSlug: string
  productName: string
  orderId?: string | null
  authorName: string
  email: string
  rating: number
  body: string
  photos: string[]
  status: ReviewStatus
  language: string
  createdAt: string
}

export type AdminReviewRequest = {
  id: string
  productSlug: string
  productName: string
  orderId?: string | null
  email: string
  customerName: string
  language: string
  sentAt: string
  completedAt?: string | null
  completed: boolean
}

export type PublicReview = {
  id: string
  authorName: string
  rating: number
  body: string
  photos: string[]
  createdAt: string
}

export type ReviewSort = 'newest' | 'highest' | 'lowest' | 'photos'

export type PublicReviews = {
  average: number
  count: number
  filtered: number
  withPhotos: number
  ratings: number[]
  page: number
  pageSize: number
  sort: ReviewSort
  rating?: number | null
  photos: string[]
  items: PublicReview[]
}

export type ReviewInvite = {
  productName: string
  productImage: string
  customerName: string
  completed: boolean
}

export const reviewsApi = {
  adminList: () => apiRequest<{ reviews: AdminReview[]; requests: AdminReviewRequest[] }>('/api/admin/reviews', { auth: 'admin' }),
  send: (body: { productSlug: string; email: string; customerName?: string; orderId?: string; language?: string }) =>
    apiRequest<AdminReviewRequest>('/api/admin/reviews/requests', { method: 'POST', body, auth: 'admin' }),
  resend: (id: string) =>
    apiRequest<AdminReviewRequest>(`/api/admin/reviews/requests/${id}/resend`, { method: 'POST', auth: 'admin' }),
  setStatus: (id: string, status: ReviewStatus) =>
    apiRequest<AdminReview>(`/api/admin/reviews/${id}`, { method: 'PATCH', body: { status }, auth: 'admin' }),
  remove: (id: string) => apiRequest<void>(`/api/admin/reviews/${id}`, { method: 'DELETE', auth: 'admin' }),
  forProduct: (slug: string, query?: { sort?: ReviewSort; page?: number; rating?: number; summary?: boolean }) => {
    const params = new URLSearchParams()
    if (query?.sort) params.set('sort', query.sort)
    if (query?.page) params.set('page', String(query.page))
    if (query?.rating) params.set('rating', String(query.rating))
    if (query?.summary) params.set('summary', 'true')
    const qs = params.toString()
    return apiRequest<PublicReviews>(`/api/reviews/product/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`)
  },
  invite: (token: string) => apiRequest<ReviewInvite>(`/api/reviews/invite/${encodeURIComponent(token)}`),
  submit: (token: string, form: FormData) => apiForm<{ id: string }>(`/api/reviews/invite/${encodeURIComponent(token)}`, form),
}

export { mapOrderSummaryToDetail, mapProductsResponse, toProductUpsert } from './types'

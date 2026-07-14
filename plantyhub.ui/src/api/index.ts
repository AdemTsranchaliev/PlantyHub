import { apiRequest } from './client'
import { getCustomerToken } from '../auth/session'
import type {
  ApiAuthResponse,
  ApiCustomer,
  ApiCustomerDetail,
  ApiDashboard,
  ApiHomepageState,
  ApiMessageResponse,
  ApiNewsletterSubscriber,
  ApiOrderDetail,
  ApiOrderSummary,
  ApiProductUpsert,
  ApiProductsByCategory,
  ApiRegisterResponse,
  ApiUserProfile,
  CheckoutPayload,
  CreateWaybillPayload,
} from './types'
import type { OrderStatus } from '../admin/mockData'
import type { HomepageState } from '../store/homepage'

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiRequest<ApiRegisterResponse>('/api/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string; rememberMe?: boolean }) =>
    apiRequest<ApiAuthResponse>('/api/auth/login', { method: 'POST', body }),
  adminLogin: (body: { email: string; password: string }) =>
    apiRequest<ApiAuthResponse>('/api/auth/admin/login', { method: 'POST', body }),
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
  updateStatus: (id: string, status: OrderStatus) =>
    apiRequest<ApiOrderDetail>(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status }, auth: 'admin' }),
  createWaybill: (id: string, body: CreateWaybillPayload) =>
    apiRequest<ApiOrderDetail>(`/api/admin/orders/${id}/waybill`, { method: 'POST', body, auth: 'admin' }),
  cancel: (id: string) => apiRequest<ApiOrderDetail>(`/api/admin/orders/${id}/cancel`, { method: 'POST', auth: 'admin' }),
}

export const customersApi = {
  getAll: () => apiRequest<ApiCustomer[]>('/api/admin/customers', { auth: 'admin' }),
  getById: (id: string) => apiRequest<ApiCustomerDetail>(`/api/admin/customers/${id}`, { auth: 'admin' }),
}

export const dashboardApi = {
  get: () => apiRequest<ApiDashboard>('/api/admin/dashboard', { auth: 'admin' }),
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
}

export const homepageApi = {
  get: () => apiRequest<ApiHomepageState>('/api/homepage'),
  update: (body: Partial<HomepageState>) => apiRequest<ApiHomepageState>('/api/homepage', { method: 'PUT', body, auth: 'admin' }),
  reset: () => apiRequest<ApiHomepageState>('/api/homepage/reset', { method: 'POST', auth: 'admin' }),
}

export { mapOrderSummaryToDetail, mapProductsResponse, toProductUpsert } from './types'

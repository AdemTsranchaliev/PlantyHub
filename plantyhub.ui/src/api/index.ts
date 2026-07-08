import { apiRequest } from './client'
import type {
  ApiAuthResponse,
  ApiCustomer,
  ApiCustomerDetail,
  ApiDashboard,
  ApiHomepageState,
  ApiOrderDetail,
  ApiOrderSummary,
  ApiProductUpsert,
  ApiProductsByCategory,
  CheckoutPayload,
  CreateWaybillPayload,
} from './types'
import type { OrderStatus } from '../admin/mockData'
import type { HomepageState } from '../store/homepage'

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiRequest<ApiAuthResponse>('/api/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    apiRequest<ApiAuthResponse>('/api/auth/login', { method: 'POST', body }),
  adminLogin: (body: { email: string; password: string }) =>
    apiRequest<ApiAuthResponse>('/api/auth/admin/login', { method: 'POST', body }),
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
  checkout: (body: CheckoutPayload) => apiRequest<ApiOrderDetail>('/api/orders', { method: 'POST', body }),
  getById: (id: string) => apiRequest<ApiOrderDetail>(`/api/orders/${id}`),
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
}

export const homepageApi = {
  get: () => apiRequest<ApiHomepageState>('/api/homepage'),
  update: (body: Partial<HomepageState>) => apiRequest<ApiHomepageState>('/api/homepage', { method: 'PUT', body, auth: 'admin' }),
  reset: () => apiRequest<ApiHomepageState>('/api/homepage/reset', { method: 'POST', auth: 'admin' }),
}

export { mapOrderSummaryToDetail, mapProductsResponse, toProductUpsert } from './types'

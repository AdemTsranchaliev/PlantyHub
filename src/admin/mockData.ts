export type CountryCode = 'BG' | 'DE' | 'FR' | 'PL' | 'IT' | 'PT' | 'CZ'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type AdminOrder = {
  id: string
  customer: string
  email: string
  country: CountryCode
  items: number
  total: string
  status: OrderStatus
  date: string
}

export type AdminCustomer = {
  id: string
  name: string
  email: string
  phone: string
  country: CountryCode
  orders: number
  totalSpent: string
  joined: string
}

export type WeeklySale = {
  dayKey: string
  amount: number
}

export type TopProduct = {
  id: string
  nameKey: string
  categoryKey: string
  sales: number
  revenue: string
}

export const mockOrders: AdminOrder[] = [
  { id: 'PH-1042', customer: 'Elena Petrova', email: 'elena.p@email.com', country: 'BG', items: 2, total: '€108.99', status: 'shipped', date: '2026-07-07' },
  { id: 'PH-1041', customer: 'Markus Weber', email: 'm.weber@email.de', country: 'DE', items: 1, total: '€99.00', status: 'processing', date: '2026-07-06' },
  { id: 'PH-1040', customer: 'Sophie Martin', email: 'sophie.m@email.fr', country: 'FR', items: 4, total: '€49.86', status: 'delivered', date: '2026-07-05' },
  { id: 'PH-1039', customer: 'Ivan Dimitrov', email: 'ivan.d@email.bg', country: 'BG', items: 1, total: '€129.00', status: 'pending', date: '2026-07-05' },
  { id: 'PH-1038', customer: 'Anna Kowalski', email: 'anna.k@email.pl', country: 'PL', items: 3, total: '€34.77', status: 'delivered', date: '2026-07-04' },
  { id: 'PH-1037', customer: 'Luca Rossi', email: 'luca.r@email.it', country: 'IT', items: 1, total: '€24.90', status: 'cancelled', date: '2026-07-03' },
  { id: 'PH-1036', customer: 'Maria Santos', email: 'maria.s@email.pt', country: 'PT', items: 2, total: '€119.89', status: 'delivered', date: '2026-07-02' },
  { id: 'PH-1035', customer: 'Jan Novak', email: 'jan.n@email.cz', country: 'CZ', items: 1, total: '€99.00', status: 'delivered', date: '2026-07-01' },
]

export const mockCustomers: AdminCustomer[] = [
  { id: 'C-001', name: 'Elena Petrova', email: 'elena.p@email.com', phone: '+359 88 123 4567', country: 'BG', orders: 3, totalSpent: '€237.98', joined: '2025-11-12' },
  { id: 'C-002', name: 'Markus Weber', email: 'm.weber@email.de', phone: '+49 170 234 5678', country: 'DE', orders: 2, totalSpent: '€198.00', joined: '2026-01-08' },
  { id: 'C-003', name: 'Sophie Martin', email: 'sophie.m@email.fr', phone: '+33 6 12 34 56 78', country: 'FR', orders: 5, totalSpent: '€156.45', joined: '2025-09-22' },
  { id: 'C-004', name: 'Ivan Dimitrov', email: 'ivan.d@email.bg', phone: '+359 87 654 3210', country: 'BG', orders: 1, totalSpent: '€129.00', joined: '2026-07-05' },
  { id: 'C-005', name: 'Anna Kowalski', email: 'anna.k@email.pl', phone: '+48 501 234 567', country: 'PL', orders: 4, totalSpent: '€89.64', joined: '2026-03-15' },
  { id: 'C-006', name: 'Luca Rossi', email: 'luca.r@email.it', phone: '+39 333 456 7890', country: 'IT', orders: 1, totalSpent: '€24.90', joined: '2026-06-18' },
  { id: 'C-007', name: 'Maria Santos', email: 'maria.s@email.pt', phone: '+351 912 345 678', country: 'PT', orders: 2, totalSpent: '€219.78', joined: '2026-04-02' },
  { id: 'C-008', name: 'Jan Novak', email: 'jan.n@email.cz', phone: '+420 601 234 567', country: 'CZ', orders: 1, totalSpent: '€99.00', joined: '2026-05-20' },
]

export function getCustomerById(id: string): AdminCustomer | undefined {
  return mockCustomers.find((c) => c.id === id)
}

export const mockNewsletterSubscribers = 1247

export const dashboardStats = {
  totalRevenue: 446.52,
  revenueTrend: 12.4,
  ordersThisMonth: 28,
  ordersTrend: 8.2,
  avgOrderValue: 68.5,
  avgOrderTrend: 3.1,
  conversionRate: 3.2,
  conversionTrend: 0.4,
  pendingOrders: 2,
  visitorsThisMonth: 8420,
} as const

export const weeklySales: WeeklySale[] = [
  { dayKey: 'mon', amount: 189 },
  { dayKey: 'tue', amount: 142 },
  { dayKey: 'wed', amount: 215 },
  { dayKey: 'thu', amount: 178 },
  { dayKey: 'fri', amount: 264 },
  { dayKey: 'sat', amount: 312 },
  { dayKey: 'sun', amount: 198 },
]

export const orderStatusCounts: Record<OrderStatus, number> = {
  pending: 2,
  processing: 3,
  shipped: 5,
  delivered: 14,
  cancelled: 1,
}

export const topProducts: TopProduct[] = [
  { id: 'homegarder-one', nameKey: 'homegarder-one', categoryKey: 'gardens', sales: 18, revenue: '€1,782.00' },
  { id: 'basil', nameKey: 'basil', categoryKey: 'pods', sales: 42, revenue: '€419.58' },
  { id: 'starter-bundle', nameKey: 'starter-bundle', categoryKey: 'gardens', sales: 11, revenue: '€1,419.00' },
  { id: 'herb-mix-12', nameKey: 'herb-mix-12', categoryKey: 'pods', sales: 24, revenue: '€479.76' },
  { id: 'mint', nameKey: 'mint', categoryKey: 'pods', sales: 31, revenue: '€309.69' },
]

export const categoryBreakdown = [
  { key: 'gardens', share: 58, revenue: '€3,201.00' },
  { key: 'pods', share: 28, revenue: '€1,548.30' },
  { key: 'consumables', share: 9, revenue: '€498.20' },
  { key: 'accessories', share: 5, revenue: '€276.80' },
] as const

export function formatEuro(amount: number) {
  return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

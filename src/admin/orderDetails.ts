import { stockImages } from '../data/images'
import type { AdminCustomer, CountryCode } from './mockData'
import { mockCustomers, mockOrders, type AdminOrder, type OrderStatus } from './mockData'

export type CourierId = 'econt' | 'speedy' | 'dhl'

export type OrderLineItem = {
  id: string
  productId: string
  nameKey: string
  name?: string
  categoryKey: 'gardens' | 'pods' | 'consumables' | 'accessories'
  quantity: number
  unitPrice: string
  total: string
  image: string
}

export type OrderAddress = {
  name: string
  phone: string
  street: string
  city: string
  postalCode: string
  country: CountryCode
}

export type PaymentMethod = 'card' | 'cod' | 'paypal'

export type Waybill = {
  number: string
  courier: CourierId
  createdAt: string
  weightKg: number
  packages: number
  codAmount?: string
  notes?: string
}

export type OrderTimelineEntry = {
  at: string
  status: OrderStatus
  note?: string
}

export type OrderDetail = AdminOrder & {
  customerId: string
  phone: string
  lineItems: OrderLineItem[]
  shipping: OrderAddress
  billing: OrderAddress
  paymentMethod: PaymentMethod
  subtotal: string
  shippingCost: string
  tax: string
  notes?: string
  waybill?: Waybill
  timeline: OrderTimelineEntry[]
}

const customerPhones: Record<string, string> = {
  'elena.p@email.com': '+359 88 123 4567',
  'm.weber@email.de': '+49 170 234 5678',
  'sophie.m@email.fr': '+33 6 12 34 56 78',
  'ivan.d@email.bg': '+359 87 654 3210',
  'anna.k@email.pl': '+48 501 234 567',
  'luca.r@email.it': '+39 333 456 7890',
  'maria.s@email.pt': '+351 912 345 678',
  'jan.n@email.cz': '+420 601 234 567',
}

const addresses: Record<string, OrderAddress> = {
  'elena.p@email.com': {
    name: 'Elena Petrova',
    phone: '+359 88 123 4567',
    street: 'bul. Vitosha 42, apt. 8',
    city: 'Sofia',
    postalCode: '1000',
    country: 'BG',
  },
  'm.weber@email.de': {
    name: 'Markus Weber',
    phone: '+49 170 234 5678',
    street: 'Hauptstraße 15',
    city: 'Munich',
    postalCode: '80331',
    country: 'DE',
  },
  'sophie.m@email.fr': {
    name: 'Sophie Martin',
    phone: '+33 6 12 34 56 78',
    street: '12 rue de la Paix',
    city: 'Paris',
    postalCode: '75002',
    country: 'FR',
  },
  'ivan.d@email.bg': {
    name: 'Ivan Dimitrov',
    phone: '+359 87 654 3210',
    street: 'ul. Aleksandrovska 88',
    city: 'Plovdiv',
    postalCode: '4000',
    country: 'BG',
  },
  'anna.k@email.pl': {
    name: 'Anna Kowalski',
    phone: '+48 501 234 567',
    street: 'ul. Marszałkowska 10/4',
    city: 'Warsaw',
    postalCode: '00-590',
    country: 'PL',
  },
  'luca.r@email.it': {
    name: 'Luca Rossi',
    phone: '+39 333 456 7890',
    street: 'Via Roma 22',
    city: 'Milan',
    postalCode: '20121',
    country: 'IT',
  },
  'maria.s@email.pt': {
    name: 'Maria Santos',
    phone: '+351 912 345 678',
    street: 'Rua Augusta 55',
    city: 'Lisbon',
    postalCode: '1100-053',
    country: 'PT',
  },
  'jan.n@email.cz': {
    name: 'Jan Novak',
    phone: '+420 601 234 567',
    street: 'Václavské náměstí 3',
    city: 'Prague',
    postalCode: '110 00',
    country: 'CZ',
  },
}

const orderLineItems: Record<string, OrderLineItem[]> = {
  'PH-1042': [
    {
      id: 'li-1',
      productId: 'homegarder-one',
      nameKey: 'homegarder-one',
      categoryKey: 'gardens',
      quantity: 1,
      unitPrice: '€99.00',
      total: '€99.00',
      image: stockImages.homeGardenProduct,
    },
    {
      id: 'li-2',
      productId: 'basil',
      nameKey: 'basil',
      categoryKey: 'pods',
      quantity: 1,
      unitPrice: '€9.99',
      total: '€9.99',
      image: stockImages.basil,
    },
  ],
  'PH-1041': [
    {
      id: 'li-3',
      productId: 'starter-bundle',
      nameKey: 'starter-bundle',
      categoryKey: 'gardens',
      quantity: 1,
      unitPrice: '€99.00',
      total: '€99.00',
      image: stockImages.homeGardenProduct,
    },
  ],
  'PH-1040': [
    {
      id: 'li-4',
      productId: 'basil',
      nameKey: 'basil',
      categoryKey: 'pods',
      quantity: 2,
      unitPrice: '€9.99',
      total: '€19.98',
      image: stockImages.basil,
    },
    {
      id: 'li-5',
      productId: 'mint',
      nameKey: 'mint',
      categoryKey: 'pods',
      quantity: 2,
      unitPrice: '€9.99',
      total: '€19.98',
      image: stockImages.mint,
    },
  ],
  'PH-1039': [
    {
      id: 'li-6',
      productId: 'homegarder-one',
      nameKey: 'homegarder-one',
      categoryKey: 'gardens',
      quantity: 1,
      unitPrice: '€129.00',
      total: '€129.00',
      image: stockImages.homeGardenProduct,
    },
  ],
  'PH-1038': [
    {
      id: 'li-7',
      productId: 'herb-mix-12',
      nameKey: 'herb-mix-12',
      categoryKey: 'pods',
      quantity: 1,
      unitPrice: '€19.99',
      total: '€19.99',
      image: stockImages.outdoorDeck,
    },
    {
      id: 'li-8',
      productId: 'mint',
      nameKey: 'mint',
      categoryKey: 'pods',
      quantity: 2,
      unitPrice: '€9.99',
      total: '€19.98',
      image: stockImages.mint,
    },
  ],
  'PH-1037': [
    {
      id: 'li-9',
      productId: 'arugula',
      nameKey: 'arugula',
      categoryKey: 'pods',
      quantity: 1,
      unitPrice: '€24.90',
      total: '€24.90',
      image: stockImages.arugula,
    },
  ],
  'PH-1036': [
    {
      id: 'li-10',
      productId: 'homegarder-one',
      nameKey: 'homegarder-one',
      categoryKey: 'gardens',
      quantity: 1,
      unitPrice: '€99.00',
      total: '€99.00',
      image: stockImages.homeGardenProduct,
    },
    {
      id: 'li-11',
      productId: 'basil',
      nameKey: 'basil',
      categoryKey: 'pods',
      quantity: 2,
      unitPrice: '€9.99',
      total: '€19.98',
      image: stockImages.basil,
    },
  ],
  'PH-1035': [
    {
      id: 'li-12',
      productId: 'starter-bundle',
      nameKey: 'starter-bundle',
      categoryKey: 'gardens',
      quantity: 1,
      unitPrice: '€99.00',
      total: '€99.00',
      image: stockImages.homeGardenProduct,
    },
  ],
}

const orderExtras: Record<
  string,
  {
    customerId: string
    paymentMethod: PaymentMethod
    subtotal: string
    shippingCost: string
    tax: string
    notes?: string
    waybill?: Waybill
    timeline: OrderTimelineEntry[]
  }
> = {
  'PH-1042': {
    customerId: 'C-001',
    paymentMethod: 'card',
    subtotal: '€108.99',
    shippingCost: '€0.00',
    tax: '€0.00',
    waybill: {
      number: 'EC-7829341560',
      courier: 'econt',
      createdAt: '2026-07-07T14:30:00',
      weightKg: 3.2,
      packages: 1,
    },
    timeline: [
      { at: '2026-07-07T09:15:00', status: 'pending', note: 'Order placed' },
      { at: '2026-07-07T10:00:00', status: 'processing', note: 'Payment confirmed' },
      { at: '2026-07-07T14:30:00', status: 'shipped', note: 'Waybill EC-7829341560 created' },
    ],
  },
  'PH-1041': {
    customerId: 'C-002',
    paymentMethod: 'paypal',
    subtotal: '€99.00',
    shippingCost: '€0.00',
    tax: '€0.00',
    timeline: [
      { at: '2026-07-06T11:20:00', status: 'pending' },
      { at: '2026-07-06T11:45:00', status: 'processing', note: 'Preparing shipment' },
    ],
  },
  'PH-1040': {
    customerId: 'C-003',
    paymentMethod: 'card',
    subtotal: '€39.96',
    shippingCost: '€4.99',
    tax: '€4.91',
    timeline: [
      { at: '2026-07-05T08:00:00', status: 'pending' },
      { at: '2026-07-05T09:30:00', status: 'processing' },
      { at: '2026-07-05T15:00:00', status: 'shipped', note: 'Speedy SP-4412098877' },
      { at: '2026-07-06T16:45:00', status: 'delivered' },
    ],
    waybill: {
      number: 'SP-4412098877',
      courier: 'speedy',
      createdAt: '2026-07-05T15:00:00',
      weightKg: 0.8,
      packages: 1,
    },
  },
  'PH-1039': {
    customerId: 'C-004',
    paymentMethod: 'cod',
    subtotal: '€129.00',
    shippingCost: '€0.00',
    tax: '€0.00',
    notes: 'Customer requested delivery after 18:00',
    timeline: [{ at: '2026-07-05T19:22:00', status: 'pending', note: 'COD order — awaiting processing' }],
  },
  'PH-1038': {
    customerId: 'C-005',
    paymentMethod: 'card',
    subtotal: '€39.97',
    shippingCost: '€4.99',
    tax: '€0.00',
    timeline: [
      { at: '2026-07-04T10:10:00', status: 'pending' },
      { at: '2026-07-04T12:00:00', status: 'processing' },
      { at: '2026-07-04T16:20:00', status: 'shipped' },
      { at: '2026-07-05T11:30:00', status: 'delivered' },
    ],
    waybill: {
      number: 'DHL-PL9923847102',
      courier: 'dhl',
      createdAt: '2026-07-04T16:20:00',
      weightKg: 0.5,
      packages: 1,
    },
  },
  'PH-1037': {
    customerId: 'C-006',
    paymentMethod: 'card',
    subtotal: '€24.90',
    shippingCost: '€0.00',
    tax: '€0.00',
    timeline: [
      { at: '2026-07-03T14:00:00', status: 'pending' },
      { at: '2026-07-03T14:30:00', status: 'cancelled', note: 'Customer cancelled before shipping' },
    ],
  },
  'PH-1036': {
    customerId: 'C-007',
    paymentMethod: 'card',
    subtotal: '€118.98',
    shippingCost: '€0.00',
    tax: '€0.91',
    timeline: [
      { at: '2026-07-02T09:00:00', status: 'pending' },
      { at: '2026-07-02T10:30:00', status: 'processing' },
      { at: '2026-07-02T14:00:00', status: 'shipped' },
      { at: '2026-07-03T10:15:00', status: 'delivered' },
    ],
    waybill: {
      number: 'EC-6612034891',
      courier: 'econt',
      createdAt: '2026-07-02T14:00:00',
      weightKg: 3.5,
      packages: 1,
    },
  },
  'PH-1035': {
    customerId: 'C-008',
    paymentMethod: 'paypal',
    subtotal: '€99.00',
    shippingCost: '€0.00',
    tax: '€0.00',
    timeline: [
      { at: '2026-07-01T16:40:00', status: 'pending' },
      { at: '2026-07-01T17:00:00', status: 'processing' },
      { at: '2026-07-02T09:30:00', status: 'shipped' },
      { at: '2026-07-03T14:20:00', status: 'delivered' },
    ],
    waybill: {
      number: 'SP-3301987654',
      courier: 'speedy',
      createdAt: '2026-07-02T09:30:00',
      weightKg: 2.8,
      packages: 1,
    },
  },
}

export function buildOrderDetail(order: AdminOrder): OrderDetail {
  const extras = orderExtras[order.id]
  const address = addresses[order.email] ?? {
    name: order.customer,
    phone: customerPhones[order.email] ?? '',
    street: '—',
    city: '—',
    postalCode: '—',
    country: order.country,
  }

  return {
    ...order,
    customerId: extras?.customerId ?? `C-${order.email}`,
    phone: address.phone,
    lineItems: orderLineItems[order.id] ?? [],
    shipping: address,
    billing: address,
    paymentMethod: extras?.paymentMethod ?? 'card',
    subtotal: extras?.subtotal ?? order.total,
    shippingCost: extras?.shippingCost ?? '€0.00',
    tax: extras?.tax ?? '€0.00',
    notes: extras?.notes,
    waybill: extras?.waybill,
    timeline: extras?.timeline ?? [{ at: `${order.date}T12:00:00`, status: order.status }],
  }
}

export const mockOrderDetails: OrderDetail[] = mockOrders.map(buildOrderDetail)

export function getOrderDetailById(id: string): OrderDetail | undefined {
  const order = mockOrders.find((o) => o.id === id)
  return order ? buildOrderDetail(order) : undefined
}

export function getCustomerByEmail(email: string): AdminCustomer | undefined {
  return mockCustomers.find((c) => c.email === email)
}

export function getOrdersByEmail(email: string): AdminOrder[] {
  return mockOrders
    .filter((o) => o.email === email)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

export function isFirstOrder(orderId: string): boolean {
  const order = mockOrders.find((o) => o.id === orderId)
  if (!order) return false
  const customerOrders = getOrdersByEmail(order.email)
  const earliest = customerOrders.reduce((min, o) => (o.date < min.date || (o.date === min.date && o.id < min.id) ? o : min))
  return earliest.id === orderId
}

export function getCustomerOrderNumber(orderId: string): number {
  const order = mockOrders.find((o) => o.id === orderId)
  if (!order) return 0
  const sorted = getOrdersByEmail(order.email).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  const index = sorted.findIndex((o) => o.id === orderId)
  return index + 1
}

export function generateWaybillNumber(courier: CourierId): string {
  const prefix = courier === 'econt' ? 'EC' : courier === 'speedy' ? 'SP' : 'DHL'
  const digits = Math.floor(1000000000 + Math.random() * 9000000000)
  return `${prefix}-${digits}`
}

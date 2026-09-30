import type { OrderStatus } from './mockData'
import { brand } from '../theme'

export const orderStatusOrder: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'returnedAfterReview',
  'unclaimed',
  'returned',
  'claim',
  'returnShipped',
  'replacement',
  'replacementShipped',
  'replaced',
  'cancelled',
]

export const nextOrderStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returnedAfterReview', 'unclaimed'],
  delivered: ['returned', 'claim'],
  returnedAfterReview: ['replacement'],
  unclaimed: ['replacement'],
  returned: ['claim'],
  claim: ['returned'],
  returnShipped: ['replacement'],
  replacement: ['cancelled'],
  replacementShipped: ['replaced', 'returnedAfterReview', 'unclaimed'],
  replaced: ['claim', 'returned'],
  cancelled: [],
}

export const orderStatusColors: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: 'rgba(227, 159, 118, 0.18)', color: '#C47A4A' },
  processing: { bg: 'rgba(47, 125, 83, 0.12)', color: brand.plantGreenDark },
  shipped: { bg: 'rgba(76, 163, 116, 0.16)', color: brand.plantGreen },
  delivered: { bg: brand.plantGreenMuted, color: brand.plantGreenDark },
  returned: { bg: 'rgba(183, 28, 28, 0.1)', color: '#B71C1C' },
  claim: { bg: 'rgba(227, 159, 118, 0.22)', color: '#A15C32' },
  replacement: { bg: 'rgba(47, 125, 83, 0.16)', color: brand.plantGreenDark },
  replacementShipped: { bg: 'rgba(76, 163, 116, 0.2)', color: brand.plantGreen },
  replaced: { bg: brand.plantGreenMuted, color: brand.plantGreenDark },
  returnShipped: { bg: 'rgba(183, 28, 28, 0.14)', color: '#B71C1C' },
  returnedAfterReview: { bg: 'rgba(183, 28, 28, 0.16)', color: '#8E2424' },
  unclaimed: { bg: 'rgba(161, 92, 50, 0.16)', color: '#A15C32' },
  cancelled: { bg: 'rgba(28, 35, 30, 0.08)', color: brand.textSecondary },
}

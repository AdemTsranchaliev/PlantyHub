export function parseEuro(value: string): number {
  const normalized = value.replace(/[^\d.,-]/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatEuro(amount: number) {
  return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const FREE_SHIPPING_THRESHOLD = 60
export const STANDARD_SHIPPING_COST = 4.99

export function calcShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
}

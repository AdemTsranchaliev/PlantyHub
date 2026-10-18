export function parseEuro(value: string): number {
  const normalized = value.replace(/[^\d.,-]/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatEuro(amount: number) {
  return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const FREE_SHIPPING_THRESHOLD = 150
export const COD_FEE_PERCENT = 1.65

export function codFeeAmount(base: number) {
  if (base <= 0) return 0
  const rate = COD_FEE_PERCENT / 100
  const round = (value: number) => Math.round(value * 100) / 100
  const guess = round((base * rate) / (1 - rate))
  for (let delta = -3; delta <= 3; delta += 1) {
    const candidate = round(guess + delta * 0.01)
    if (candidate < 0) continue
    if (round((base + candidate) * rate) === candidate) return candidate
  }
  return guess
}
export const STANDARD_SHIPPING_COST = 4.99

export function calcShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
}

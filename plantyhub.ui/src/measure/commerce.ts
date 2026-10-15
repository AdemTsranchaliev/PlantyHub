import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { analyticsEnabled, gtmEnabled, metaPixelEnabled } from './config'
import { getCookieConsent, useCookieConsent } from './consent'
import { parseEuro } from '../utils/price'
import type { CartItem } from '../store/cart'

const CURRENCY = 'EUR'
const PENDING_PURCHASE_KEY = 'plantyhub.pending-purchase'

export type TrackedItem = {
  id: string
  name: string
  category: string
  price: string | number
  quantity: number
}

type Totals = {
  value: number
  tax?: number
  shipping?: number
  coupon?: string
}

export function cartTrackingItems(items: CartItem[]): TrackedItem[] {
  return items.map((item) => ({ id: item.productId, name: item.name, category: item.category, price: item.price, quantity: item.quantity }))
}

function amount(price: string | number) {
  return typeof price === 'number' ? price : parseEuro(price)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function gaItems(items: TrackedItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    item_category: item.category,
    price: round(amount(item.price)),
    quantity: item.quantity,
  }))
}

function metaParams(items: TrackedItem[], value: number) {
  return {
    content_ids: items.map((item) => item.id),
    content_type: 'product',
    contents: items.map((item) => ({ id: item.id, quantity: item.quantity, item_price: round(amount(item.price)) })),
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value: round(value),
    currency: CURRENCY,
  }
}

function itemsValue(items: TrackedItem[]) {
  return items.reduce((sum, item) => sum + amount(item.price) * item.quantity, 0)
}

/**
 * Sends one ecommerce event to GTM (dataLayer), GA4 (gtag) and Meta Pixel (standard events only).
 * Deferred so the tags from AnalyticsConsent are set up first on a fresh page load.
 */
function send(gaEvent: string, ecommerce: Record<string, unknown>, metaEvent: string | null, meta: Record<string, unknown>, eventId?: string) {
  window.setTimeout(() => {
    if (getCookieConsent() !== 'granted') return

    if (gtmEnabled) {
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({ ecommerce: null })
      window.dataLayer.push({ event: gaEvent, ecommerce })
    }

    if (analyticsEnabled) window.gtag?.('event', gaEvent, ecommerce)

    if (metaPixelEnabled && metaEvent) window.fbq?.('track', metaEvent, meta, eventId ? { eventID: eventId } : undefined)
  }, 0)
}

export function trackViewItem(item: TrackedItem) {
  const value = round(amount(item.price))
  send('view_item', { currency: CURRENCY, value, items: gaItems([item]) }, 'ViewContent', metaParams([item], value))
}

/** Reports a product page view once per product. */
export function useTrackViewItem(category: string, product: { id: string; name: string; price: string } | null | undefined) {
  const id = product?.id
  useEffect(() => {
    if (!product) return
    trackViewItem({ id: product.id, name: product.name, category, price: product.price, quantity: 1 })
    // Only a new product counts as a new view, not a language switch or a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, id])
}

export function trackAddToCart(item: TrackedItem) {
  const value = round(amount(item.price) * item.quantity)
  send('add_to_cart', { currency: CURRENCY, value, items: gaItems([item]) }, 'AddToCart', metaParams([item], value))
}

export function trackViewCart(items: TrackedItem[]) {
  if (items.length === 0) return
  const value = round(itemsValue(items))
  send('view_cart', { currency: CURRENCY, value, items: gaItems(items) }, null, {})
}

export function trackBeginCheckout(items: TrackedItem[]) {
  if (items.length === 0) return
  const value = round(itemsValue(items))
  send('begin_checkout', { currency: CURRENCY, value, items: gaItems(items) }, 'InitiateCheckout', metaParams(items, value))
}

/** Checkout marks the order it just placed, so a reload or a later visit to the order page is not counted again. */
export function markPendingPurchase(orderId: string) {
  try {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, orderId)
  } catch {
    /* private mode */
  }
}

export function trackPurchase(orderId: string, items: TrackedItem[], totals: Totals) {
  try {
    if (sessionStorage.getItem(PENDING_PURCHASE_KEY) !== orderId) return
    sessionStorage.removeItem(PENDING_PURCHASE_KEY)
  } catch {
    return
  }

  const value = round(totals.value)
  send(
    'purchase',
    {
      transaction_id: orderId,
      currency: CURRENCY,
      value,
      tax: totals.tax != null ? round(totals.tax) : undefined,
      shipping: totals.shipping != null ? round(totals.shipping) : undefined,
      coupon: totals.coupon || undefined,
      items: gaItems(items),
    },
    'Purchase',
    metaParams(items, value),
    `purchase-${orderId}`,
  )
}

const QR_SOURCES = ['box', 'pods', 'instr'] as const
const QR_SENT_KEY = 'plantyhub.qr-open'

export type QrSource = (typeof QR_SOURCES)[number]

export function isQrSource(value: string | null): value is QrSource {
  return !!value && (QR_SOURCES as readonly string[]).includes(value)
}

function sentQrSources() {
  try {
    const raw = sessionStorage.getItem(QR_SENT_KEY)
    return new Set(raw ? raw.split(',').filter(isQrSource) : [])
  } catch {
    return new Set<QrSource>()
  }
}

/** Which printed label was scanned. Sent only after cookie consent, once per label in the session. */
function trackQrOpen(source: QrSource) {
  window.setTimeout(() => {
    if (getCookieConsent() !== 'granted') return
    const payload = { qr_source: source }
    if (gtmEnabled) {
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({ event: 'qr_open', ...payload })
    }
    if (analyticsEnabled) window.gtag?.('event', 'qr_open', payload)
  }, 0)
}

/** Reads ?from=box|pods|instr on /start and reports it once consent is granted. */
export function useTrackQrSource() {
  const [params] = useSearchParams()
  const source = params.get('from')
  const { consent } = useCookieConsent()

  useEffect(() => {
    if (consent !== 'granted' || !isQrSource(source)) return
    const sent = sentQrSources()
    if (sent.has(source)) return
    sent.add(source)
    try {
      sessionStorage.setItem(QR_SENT_KEY, [...sent].join(','))
    } catch {
      /* private mode — still send this visit */
    }
    trackQrOpen(source)
  }, [consent, source])
}

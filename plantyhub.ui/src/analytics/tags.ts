import { clarityEnabled, CLARITY_PROJECT_ID, gtmEnabled, GTM_ID, metaPixelEnabled, META_PIXEL_ID } from './config'
import { getCookieConsent, type CookieConsent } from './consent'
import { clearTrackingCookies } from './googleAnalytics'

type Fbq = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  loaded: boolean
  version: string
  push: Fbq
}

type Clarity = {
  (...args: unknown[]): void
  q?: unknown[]
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
    clarity?: Clarity
  }
}

const tagsEnabled = gtmEnabled || metaPixelEnabled || clarityEnabled

let appliedConsent: CookieConsent | null | undefined
let gtmLoaded = false
let metaLoaded = false
let clarityLoaded = false
let skipInitialGtmView = false
let skipInitialMetaView = false
let lastTrackedUrl = ''

function grantStorage() {
  return {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  } as const
}

const denied = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const

function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(arguments)
  window.gtag ??= gtag
}

function consentAlreadySet() {
  return (window.dataLayer ?? []).some((item) => {
    try {
      return Array.from(item as ArrayLike<unknown>)[0] === 'consent'
    } catch {
      return false
    }
  })
}

function loadGtm() {
  if (gtmLoaded || !gtmEnabled) return
  gtmLoaded = true
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.id = 'gtm-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`
  document.head.appendChild(script)
  skipInitialGtmView = true
}

function loadMeta() {
  if (metaLoaded || !metaPixelEnabled) return
  metaLoaded = true
  if (!window.fbq) {
    const fbq = function fbq(this: Fbq) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments)
      else fbq.queue.push(arguments)
    } as Fbq
    fbq.queue = []
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.push = fbq
    window.fbq = fbq
    window._fbq = fbq
  }
  const script = document.createElement('script')
  script.id = 'meta-pixel'
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
  window.fbq('init', META_PIXEL_ID)
  window.fbq('track', 'PageView')
  skipInitialMetaView = true
}

function loadClarity() {
  if (clarityLoaded || !clarityEnabled) return
  clarityLoaded = true
  window.clarity = window.clarity || function clarity() {
    const fn = window.clarity
    if (!fn) return
    fn.q = fn.q || []
    fn.q.push(arguments)
  }
  const script = document.createElement('script')
  script.id = 'microsoft-clarity'
  script.async = true
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_PROJECT_ID)}`
  document.head.appendChild(script)
  window.clarity('consentv2', { ad_Storage: 'granted', analytics_Storage: 'granted' })
}

function denyLoadedTags() {
  if (gtmLoaded || consentAlreadySet()) gtag('consent', 'update', denied)
  if (clarityLoaded) window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
}

/** Load GTM, Meta Pixel and Clarity only after consent. */
export function syncTags(consent: CookieConsent | null) {
  if (!tagsEnabled || consent === appliedConsent) return
  appliedConsent = consent

  if (consent !== 'granted') {
    lastTrackedUrl = ''
    skipInitialGtmView = false
    skipInitialMetaView = false
    denyLoadedTags()
    clearTrackingCookies()
    return
  }

  gtag('consent', consentAlreadySet() ? 'update' : 'default', grantStorage())
  loadGtm()
  loadMeta()
  loadClarity()
}

export function trackTagPageView() {
  if (!tagsEnabled || getCookieConsent() !== 'granted') return
  const url = window.location.pathname + window.location.search + window.location.hash
  if (url === lastTrackedUrl) return
  lastTrackedUrl = url

  if (gtmEnabled && gtmLoaded) {
    if (skipInitialGtmView) skipInitialGtmView = false
    else {
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({
        event: 'virtual_page_view',
        page_title: document.title,
        page_location: window.location.href,
        page_path: url,
      })
    }
  }

  if (metaPixelEnabled && metaLoaded && window.fbq) {
    if (skipInitialMetaView) skipInitialMetaView = false
    else window.fbq('track', 'PageView')
  }
}

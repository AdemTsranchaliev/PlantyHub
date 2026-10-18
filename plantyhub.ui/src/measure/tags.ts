import { gtmEnabled, GTM_ID } from './config'
import { getCookieConsent, type CookieConsent } from './consent'
import { clearTrackingCookies } from './visits'

type Clarity = {
  (...args: unknown[]): void
  q?: unknown[]
}

declare global {
  interface Window {
    clarity?: Clarity
  }
}

let appliedConsent: CookieConsent | null | undefined
let gtmLoaded = false
let skipInitialGtmView = false
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
  if (document.getElementById('gtm-script')) {
    gtmLoaded = true
    skipInitialGtmView = true
    return
  }
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

function denyLoadedTags() {
  if (gtmLoaded || consentAlreadySet()) gtag('consent', 'update', denied)
  window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
}

/** Load Tag Manager only after consent. GA4, Meta and Clarity are tags inside the container. */
export function syncTags(consent: CookieConsent | null) {
  if (!gtmEnabled || consent === appliedConsent) return
  appliedConsent = consent

  if (consent !== 'granted') {
    lastTrackedUrl = ''
    skipInitialGtmView = false
    denyLoadedTags()
    clearTrackingCookies()
    return
  }

  gtag('consent', consentAlreadySet() ? 'update' : 'default', grantStorage())
  loadGtm()
}

export function trackTagPageView() {
  if (!gtmEnabled || !gtmLoaded || getCookieConsent() !== 'granted') return
  const url = window.location.pathname + window.location.search + window.location.hash
  if (url === lastTrackedUrl) return
  lastTrackedUrl = url

  if (skipInitialGtmView) {
    skipInitialGtmView = false
    return
  }

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({
    event: 'virtual_page_view',
    page_title: document.title,
    page_location: window.location.href,
    page_path: url,
  })
}

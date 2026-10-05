import { analyticsEnabled, GA_MEASUREMENT_ID } from './config'
import { getCookieConsent, type CookieConsent } from './consent'

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

let scriptRequested = false
let lastTrackedUrl = ''
let initialViewPending = false
let appliedConsent: CookieConsent | null | undefined

function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer ?? []
  // gtag.js runs queued commands only when they are an Arguments object.
  window.dataLayer.push(arguments)
}

function installGtag() {
  window.dataLayer = window.dataLayer ?? []
  window.gtag ??= gtag
}

function setCollectionDisabled(disabled: boolean) {
  ;(window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = disabled
}

export function clearTrackingCookies() {
  const host = window.location.hostname
  const domains = new Set<string>([host])
  if (host.startsWith('www.')) domains.add(host.slice(4))
  else if (host.includes('.')) domains.add(`.${host}`)

  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim()
    if (!name || !['_ga', '_gid', '_fbp', '_fbc', '_clck', '_clsk', '_gcl'].some((prefix) => name.startsWith(prefix))) continue
    document.cookie = `${name}=; Max-Age=0; path=/`
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`
    }
  }
}

function loadScript() {
  if (scriptRequested) return
  scriptRequested = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
  document.head.appendChild(script)
}

const denied = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const

/** Load GA4 only after consent. A later refusal stops further collection and clears its cookies. */
export function syncAnalytics(consent: CookieConsent | null) {
  if (!analyticsEnabled || consent === appliedConsent) return
  appliedConsent = consent
  installGtag()

  if (consent !== 'granted') {
    lastTrackedUrl = ''
    initialViewPending = false
    setCollectionDisabled(true)
    if (scriptRequested) gtag('consent', 'update', denied)
    clearTrackingCookies()
    return
  }

  setCollectionDisabled(false)
  if (!scriptRequested) {
    gtag('consent', 'default', { ...denied, analytics_storage: 'granted' })
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID)
    initialViewPending = true
    loadScript()
    return
  }

  gtag('consent', 'update', { ...denied, analytics_storage: 'granted' })
}

export function trackPageView() {
  if (!analyticsEnabled || getCookieConsent() !== 'granted') return
  installGtag()
  const url = window.location.pathname + window.location.search + window.location.hash
  if (url === lastTrackedUrl) return
  lastTrackedUrl = url
  // The first config call already reports the current page.
  if (initialViewPending) {
    initialViewPending = false
    return
  }
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: url,
  })
}

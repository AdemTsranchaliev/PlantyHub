import { useSyncExternalStore } from 'react'
import { trackingEnabled } from './config'

const STORAGE_KEY = 'plantyhub.cookie-consent'

export type CookieConsent = 'granted' | 'denied'

type ConsentState = {
  consent: CookieConsent | null
  bannerOpen: boolean
}

function storedConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

function createState(consent: CookieConsent | null, bannerOpen: boolean): ConsentState {
  return { consent, bannerOpen }
}

const stored = storedConsent()
let state: ConsentState = createState(stored, trackingEnabled && stored === null)

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeCookieConsent(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCookieConsentState() {
  return state
}

export function getCookieConsent() {
  return state.consent
}

export function setCookieConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, consent)
  } catch {
    /* private mode */
  }
  state = createState(consent, false)
  emit()
}

export function openCookieSettings() {
  if (!trackingEnabled) return
  state = createState(state.consent, true)
  emit()
}

export function useCookieConsent() {
  return useSyncExternalStore(subscribeCookieConsent, getCookieConsentState, getCookieConsentState)
}

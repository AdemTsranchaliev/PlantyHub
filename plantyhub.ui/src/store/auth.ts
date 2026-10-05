import { authApi } from '../api'
import type { ApiAuthResponse } from '../api/types'
import {
  clearAdminSession,
  clearCustomerSession,
  getCustomerToken,
  getCustomerUser,
  hasAdminRole,
  setAdminSession,
  setCustomerSession,
  type SessionUser,
} from '../auth/session'

const listeners = new Set<() => void>()
let customer: SessionUser | null = getCustomerUser()

if (typeof window !== 'undefined') {
  window.addEventListener('plantyhub-session-cleared', () => {
    customer = getCustomerUser()
    emit()
  })
}

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCustomerSession(): SessionUser | null {
  return customer
}

export function isCustomerLoggedIn(): boolean {
  return Boolean(getCustomerToken() && customer)
}

export function setCustomerFromAuth(response: ApiAuthResponse, remember = true) {
  setCustomerSession(response, remember)
  customer = { email: response.email, name: response.name, roles: response.roles }
  if (hasAdminRole(response.roles)) {
    setAdminSession(response)
  }
  emit()
}

export function logoutCustomer() {
  const wasAdmin = hasAdminRole(customer?.roles)
  clearCustomerSession()
  if (wasAdmin) clearAdminSession()
  customer = null
  emit()
}

export async function validateCustomerSession(): Promise<SessionUser | null> {
  if (!getCustomerToken()) {
    customer = null
    emit()
    return null
  }

  try {
    const profile = await authApi.me()
    customer = { email: profile.email, name: profile.name, roles: profile.roles }
    const token = getCustomerToken()
    if (token && hasAdminRole(profile.roles)) {
      setAdminSession({ token, email: profile.email, name: profile.name, roles: profile.roles })
    }
    emit()
    return customer
  } catch {
    clearCustomerSession()
    customer = null
    emit()
    return null
  }
}

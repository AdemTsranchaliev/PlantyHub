import { authApi } from '../api'
import type { ApiAuthResponse } from '../api/types'
import {
  clearCustomerSession,
  getCustomerToken,
  getCustomerUser,
  setCustomerSession,
  type SessionUser,
} from '../auth/session'

const listeners = new Set<() => void>()
let customer: SessionUser | null = getCustomerUser()

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
  emit()
}

export function logoutCustomer() {
  clearCustomerSession()
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
    emit()
    return customer
  } catch {
    clearCustomerSession()
    customer = null
    emit()
    return null
  }
}

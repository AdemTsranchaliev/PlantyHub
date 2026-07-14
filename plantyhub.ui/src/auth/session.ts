const ADMIN_TOKEN_KEY = 'plantyhub_admin_token'
const ADMIN_USER_KEY = 'plantyhub_admin_user'
const CUSTOMER_TOKEN_KEY = 'plantyhub_customer_token'
const CUSTOMER_USER_KEY = 'plantyhub_customer_user'

function customerStorage(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage
}

export type SessionUser = {
  email: string
  name: string
  roles: string[]
}

export type AuthResponse = {
  token: string
  email: string
  name: string
  roles: string[]
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function writeJsonTo(storage: Storage, key: string, value: unknown) {
  storage.setItem(key, JSON.stringify(value))
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function getCustomerToken(): string | null {
  return sessionStorage.getItem(CUSTOMER_TOKEN_KEY) ?? localStorage.getItem(CUSTOMER_TOKEN_KEY)
}

export function getAdminUser(): SessionUser | null {
  return readJson<SessionUser>(ADMIN_USER_KEY)
}

export function getCustomerUser(): SessionUser | null {
  const raw = sessionStorage.getItem(CUSTOMER_USER_KEY) ?? localStorage.getItem(CUSTOMER_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function setAdminSession(response: AuthResponse) {
  localStorage.setItem(ADMIN_TOKEN_KEY, response.token)
  writeJson(ADMIN_USER_KEY, { email: response.email, name: response.name, roles: response.roles })
}

export function setCustomerSession(response: AuthResponse, remember = true) {
  clearCustomerSession()
  const storage = customerStorage(remember)
  storage.setItem(CUSTOMER_TOKEN_KEY, response.token)
  writeJsonTo(storage, CUSTOMER_USER_KEY, { email: response.email, name: response.name, roles: response.roles })
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
}

export function clearCustomerSession() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(CUSTOMER_TOKEN_KEY)
    storage.removeItem(CUSTOMER_USER_KEY)
  }
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken() && getAdminUser())
}

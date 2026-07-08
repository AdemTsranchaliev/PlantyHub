const ADMIN_TOKEN_KEY = 'plantyhub_admin_token'
const ADMIN_USER_KEY = 'plantyhub_admin_user'
const CUSTOMER_TOKEN_KEY = 'plantyhub_customer_token'
const CUSTOMER_USER_KEY = 'plantyhub_customer_user'

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

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function getCustomerToken(): string | null {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY)
}

export function getAdminUser(): SessionUser | null {
  return readJson<SessionUser>(ADMIN_USER_KEY)
}

export function getCustomerUser(): SessionUser | null {
  return readJson<SessionUser>(CUSTOMER_USER_KEY)
}

export function setAdminSession(response: AuthResponse) {
  localStorage.setItem(ADMIN_TOKEN_KEY, response.token)
  writeJson(ADMIN_USER_KEY, { email: response.email, name: response.name, roles: response.roles })
}

export function setCustomerSession(response: AuthResponse) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, response.token)
  writeJson(CUSTOMER_USER_KEY, { email: response.email, name: response.name, roles: response.roles })
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY)
  localStorage.removeItem(CUSTOMER_USER_KEY)
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken() && getAdminUser())
}

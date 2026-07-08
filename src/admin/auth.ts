const ADMIN_STORAGE_KEY = 'plantyhub_admin'

export type AdminUser = {
  email: string
  name: string
}

export function getAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  } catch {
    return null
  }
}

export function setAdminUser(user: AdminUser) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user))
}

export function clearAdminUser() {
  localStorage.removeItem(ADMIN_STORAGE_KEY)
}

export function isAdminAuthenticated(): boolean {
  return getAdminUser() !== null
}

const ADMIN_EMAIL = 'admin@plantyhub.com'
const ADMIN_PASSWORD = 'admin123'

export function loginAdmin(email: string, password: string): AdminUser | null {
  const trimmed = email.trim().toLowerCase()
  if (trimmed === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const user: AdminUser = { email: trimmed, name: 'Admin' }
    setAdminUser(user)
    return user
  }
  return null
}

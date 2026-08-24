import { authApi } from '../api'
import { ApiError } from '../api/client'
import {
  clearAdminSession,
  getAdminUser,
  isAdminAuthenticated,
  type SessionUser,
} from '../auth/session'
import { setCustomerFromAuth } from '../store/auth'

export type AdminUser = {
  email: string
  name: string
}

export type AdminLoginResult =
  | { ok: true; user: AdminUser }
  | { ok: false; reason: 'invalid' | 'network' | 'validation' }

export { getAdminUser, isAdminAuthenticated, clearAdminSession as clearAdminUser }

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  const trimmedEmail = email.trim()
  const trimmedPassword = password.trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedPassword.length < 6) {
    return { ok: false, reason: 'validation' }
  }

  try {
    const response = await authApi.adminLogin({ email: trimmedEmail, password: trimmedPassword })
    setCustomerFromAuth(response)
    return { ok: true, user: { email: response.email, name: response.name } }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { ok: false, reason: 'invalid' }
    }
    return { ok: false, reason: 'network' }
  }
}

export function getAdminSessionUser(): SessionUser | null {
  return getAdminUser()
}

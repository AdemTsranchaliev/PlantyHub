import { authApi } from '../api'
import {
  clearAdminSession,
  getAdminUser,
  isAdminAuthenticated,
  setAdminSession,
  type SessionUser,
} from '../auth/session'

export type AdminUser = {
  email: string
  name: string
}

export { getAdminUser, isAdminAuthenticated, clearAdminSession as clearAdminUser }

export async function loginAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    const response = await authApi.adminLogin({ email: email.trim(), password })
    setAdminSession(response)
    return { email: response.email, name: response.name }
  } catch {
    return null
  }
}

export function getAdminSessionUser(): SessionUser | null {
  return getAdminUser()
}

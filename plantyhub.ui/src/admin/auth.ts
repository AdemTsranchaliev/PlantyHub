import {
  clearAdminSession,
  getAdminUser,
  isAdminAuthenticated,
  type SessionUser,
} from '../auth/session'

export { getAdminUser, isAdminAuthenticated, clearAdminSession as clearAdminUser }

export function getAdminSessionUser(): SessionUser | null {
  return getAdminUser()
}

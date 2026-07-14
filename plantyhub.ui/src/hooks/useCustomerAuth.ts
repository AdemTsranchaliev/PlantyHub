import { useSyncExternalStore } from 'react'
import { getCustomerSession, isCustomerLoggedIn, logoutCustomer, subscribeAuth } from '../store/auth'

export function useCustomerAuth() {
  const customer = useSyncExternalStore(subscribeAuth, getCustomerSession, getCustomerSession)
  return {
    customer,
    isLoggedIn: isCustomerLoggedIn(),
    logout: logoutCustomer,
  }
}

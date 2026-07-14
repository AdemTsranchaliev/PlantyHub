import { useEffect } from 'react'
import { validateCustomerSession } from '../store/auth'

/** Restores and validates the customer session on storefront load. */
export default function SessionBootstrap() {
  useEffect(() => {
    void validateCustomerSession()
  }, [])

  return null
}

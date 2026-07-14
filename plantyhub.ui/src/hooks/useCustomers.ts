import { useEffect, useState } from 'react'
import { customersApi } from '../api'
import type { ApiCustomer, ApiCustomerDetail } from '../api/types'

export function useCustomers() {
  const [customers, setCustomers] = useState<ApiCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void customersApi
      .getAll()
      .then((result) => {
        if (!cancelled) setCustomers(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load customers')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { customers, loading, error }
}

export function useCustomerDetail(id: string | undefined) {
  const [data, setData] = useState<ApiCustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    void customersApi
      .getById(id)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Customer not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { OrderStatus } from '../admin/mockData'
import type { Waybill } from '../admin/orderDetails'
import type { OrderDetail } from '../admin/orderDetails'
import {
  createWaybill,
  fetchOrderDetail,
  getOrdersError,
  getOrdersLoading,
  getOrdersState,
  getOrderDetail,
  loadOrders,
  resetOrdersState,
  subscribeOrders,
  updateOrderStatus,
} from '../store/orders'

export function useOrders() {
  return useSyncExternalStore(subscribeOrders, getOrdersState, getOrdersState)
}

export function useOrdersBootstrap() {
  useEffect(() => {
    void loadOrders()
  }, [])
}

export function useOrderDetail(id: string | undefined, admin = false) {
  const orders = useOrders()
  const cached = useMemo(() => (id ? getOrderDetail(id) ?? orders.find((o) => o.id === id) : undefined), [orders, id])
  const [detail, setDetail] = useState<OrderDetail | undefined>(cached)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      setDetail(undefined)
      return
    }
    const existing = getOrderDetail(id)
    if (existing?.lineItems?.length) {
      setDetail(existing)
      return
    }
    setLoading(true)
    void fetchOrderDetail(id, admin).then((result) => {
      setDetail(result)
      setLoading(false)
    })
  }, [id, admin])

  return { order: detail ?? cached, loading }
}

export function useOrdersStore() {
  return {
    loading: useSyncExternalStore(subscribeOrders, getOrdersLoading, getOrdersLoading),
    error: useSyncExternalStore(subscribeOrders, getOrdersError, getOrdersError),
    reload: loadOrders,
    updateOrderStatus: (id: string, status: OrderStatus) => updateOrderStatus(id, status),
    createWaybill: (
      id: string,
      data: Omit<Waybill, 'number' | 'createdAt'> & { number: string },
    ) => createWaybill(id, data),
    resetOrdersState,
  }
}

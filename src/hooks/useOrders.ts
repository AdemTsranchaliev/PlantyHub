import { useMemo, useSyncExternalStore } from 'react'
import type { OrderStatus } from '../admin/mockData'
import type { Waybill } from '../admin/orderDetails'
import {
  createWaybill,
  getOrdersState,
  resetOrdersState,
  subscribeOrders,
  updateOrderStatus,
} from '../store/orders'

export function useOrders() {
  return useSyncExternalStore(subscribeOrders, getOrdersState, getOrdersState)
}

export function useOrderDetail(id: string | undefined) {
  const orders = useOrders()
  return useMemo(() => (id ? orders.find((o) => o.id === id) : undefined), [orders, id])
}

export function useOrdersStore() {
  return {
    updateOrderStatus: (id: string, status: OrderStatus) => updateOrderStatus(id, status),
    createWaybill: (
      id: string,
      data: Omit<Waybill, 'number' | 'createdAt'> & { number: string },
    ) => createWaybill(id, data),
    resetOrdersState,
  }
}

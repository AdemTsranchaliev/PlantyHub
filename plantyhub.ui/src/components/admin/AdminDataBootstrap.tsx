import { useEffect } from 'react'
import { loadOrders } from '../../store/orders'
import { loadProducts } from '../../store/products'
import { loadHomepage } from '../../store/homepage'

/** Loads admin data from the API when admin layout mounts. */
export default function AdminDataBootstrap() {
  useEffect(() => {
    void Promise.all([loadProducts(true), loadOrders(), loadHomepage()])
  }, [])
  return null
}

import { useEffect } from 'react'
import { loadHomepage } from '../store/homepage'
import { loadProducts } from '../store/products'

/** Loads storefront data from the API on first mount. */
export default function DataBootstrap() {
  useEffect(() => {
    void Promise.all([loadProducts(false), loadHomepage()])
  }, [])
  return null
}

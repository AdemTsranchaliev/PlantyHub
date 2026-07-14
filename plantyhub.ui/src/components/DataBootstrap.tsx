import { useEffect } from 'react'
import { loadHomepage } from '../store/homepage'
import { loadProducts } from '../store/products'

/** Loads storefront data from the API on mount and when the tab regains focus. */
export default function DataBootstrap() {
  useEffect(() => {
    void Promise.all([loadProducts(false), loadHomepage()])

    const onFocus = () => {
      void loadProducts(false)
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  return null
}

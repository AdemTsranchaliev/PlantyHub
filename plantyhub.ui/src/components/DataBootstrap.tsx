import { useEffect } from 'react'
import { loadHomepage } from '../store/homepage'
import { loadProducts } from '../store/products'
import { loadSiteAssets } from '../store/siteAssets'

/** Loads storefront data from the API on mount and when the tab regains focus. */
export default function DataBootstrap() {
  useEffect(() => {
    void Promise.all([loadProducts(false), loadHomepage(), loadSiteAssets()])

    const onFocus = () => {
      void loadProducts(false)
      void loadSiteAssets()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  return null
}

import { useSyncExternalStore } from 'react'
import {
  getSiteAsset,
  getSiteAssetsLoading,
  getSiteAssetsState,
  loadSiteAssets,
  setSiteAsset,
  subscribeSiteAssets,
} from '../store/siteAssets'

export function useSiteAssetsStore() {
  const state = useSyncExternalStore(subscribeSiteAssets, getSiteAssetsState, getSiteAssetsState)
  const loading = useSyncExternalStore(subscribeSiteAssets, getSiteAssetsLoading, getSiteAssetsLoading)
  return {
    images: state.images,
    loading,
    setSiteAsset,
    reload: loadSiteAssets,
  }
}

export function useSiteAsset(key: string, fallback?: string): string {
  const state = useSyncExternalStore(subscribeSiteAssets, getSiteAssetsState, getSiteAssetsState)
  return state.images[key] || fallback || getSiteAsset(key, fallback)
}

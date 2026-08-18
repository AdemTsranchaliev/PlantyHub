import { getDefaultSiteAssets } from '../admin/siteAssetsSchema'
import { siteAssetsApi } from '../api'

export type SiteAssetsState = {
  images: Record<string, string>
}

const listeners = new Set<() => void>()
let cachedState: SiteAssetsState | null = null
let loading = false

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeSiteAssets(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function createDefaultSiteAssetsState(): SiteAssetsState {
  return { images: getDefaultSiteAssets() }
}

function mergeWithDefaults(remote: Record<string, string> | undefined): SiteAssetsState {
  return {
    images: { ...getDefaultSiteAssets(), ...(remote ?? {}) },
  }
}

function setState(state: SiteAssetsState) {
  cachedState = state
  emit()
}

export function getSiteAssetsState(): SiteAssetsState {
  if (!cachedState) cachedState = createDefaultSiteAssetsState()
  return cachedState
}

export function getSiteAssetsLoading() {
  return loading
}

export async function loadSiteAssets(): Promise<SiteAssetsState> {
  loading = true
  emit()
  try {
    const remote = await siteAssetsApi.get()
    const merged = mergeWithDefaults(remote.images)
    setState(merged)
    return merged
  } catch {
    const defaults = createDefaultSiteAssetsState()
    setState(defaults)
    return defaults
  } finally {
    loading = false
    emit()
  }
}

export async function setSiteAsset(key: string, url: string) {
  const current = getSiteAssetsState()
  const nextImages = { ...current.images, [key]: url }
  setState({ images: nextImages })
  try {
    const remote = await siteAssetsApi.update(nextImages)
    setState(mergeWithDefaults(remote.images))
  } catch {
    setState(current)
    throw new Error('Failed to save site asset')
  }
}

export function getSiteAsset(key: string, fallback?: string): string {
  const state = getSiteAssetsState()
  return state.images[key] || fallback || getDefaultSiteAssets()[key] || ''
}

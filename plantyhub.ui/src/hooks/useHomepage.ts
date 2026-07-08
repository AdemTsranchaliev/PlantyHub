import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import type { LanguageCode } from '../i18n/languages'
import type { HomepageSectionKey } from '../admin/homepageSchema'
import {
  getHomepageState,
  subscribeHomepage,
  getHomepageText,
  getHomepageImage,
  interpolate,
  setSectionEnabled,
  setHomepageText,
  setHomepageImage,
  resetHomepageState,
  loadHomepage,
} from '../store/homepage'

function useLang(): LanguageCode {
  const { i18n } = useTranslation()
  const code = i18n.language?.split('-')[0] ?? 'en'
  if (code === 'bg' || code === 'de' || code === 'fr') return code
  return 'en'
}

export function useHomepageBootstrap() {
  useEffect(() => {
    void loadHomepage()
  }, [])
}

export function useHomepageStore() {
  const state = useSyncExternalStore(subscribeHomepage, getHomepageState, getHomepageState)
  return {
    state,
    setSectionEnabled,
    setHomepageText,
    setHomepageImage,
    resetHomepageState,
    reload: loadHomepage,
  }
}

export function useSectionEnabled(section: HomepageSectionKey): boolean {
  const state = useSyncExternalStore(subscribeHomepage, getHomepageState, getHomepageState)
  return state.sections[section] ?? true
}

export function useHomepageText(key: string, vars?: Record<string, string>): string {
  const { t } = useTranslation()
  const state = useSyncExternalStore(subscribeHomepage, getHomepageState, getHomepageState)
  const lang = useLang()
  return useMemo(() => {
    const raw = getHomepageText(state, key, lang, t(key))
    return interpolate(raw, vars)
  }, [state, key, lang, vars, t])
}

export function useHomepageImage(key: string, fallback: string): string {
  const state = useSyncExternalStore(subscribeHomepage, getHomepageState, getHomepageState)
  return useMemo(() => getHomepageImage(state, key, fallback), [state, key, fallback])
}

export const useHt = useHomepageText
export const useHi = useHomepageImage

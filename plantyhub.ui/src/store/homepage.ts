import type { LanguageCode } from '../i18n/languages'
import en from '../i18n/locales/en.json'
import bg from '../i18n/locales/bg.json'
import de from '../i18n/locales/de.json'
import fr from '../i18n/locales/fr.json'
import {
  type HomepageSectionKey,
  homepageSectionOrder,
  getAllTextKeys,
  getDefaultImages,
} from '../admin/homepageSchema'
import { homepageApi } from '../api'

export type HomepageState = {
  layoutVersion?: number
  sections: Record<HomepageSectionKey, boolean>
  texts: Record<LanguageCode, Record<string, string>>
  images: Record<string, string>
}

const LAYOUT_VERSION = 2

const defaultSectionEnabled = Object.fromEntries(
  homepageSectionOrder.map((key) => [
    key,
    key === 'hero' ||
      key === 'product' ||
      key === 'howItWorks' ||
      key === 'podsGrid' ||
      key === 'socialProof' ||
      key === 'cta',
  ]),
) as Record<HomepageSectionKey, boolean>

const localeFiles = { en, bg, de, fr } as const
const listeners = new Set<() => void>()
let cachedState: HomepageState | null = null
let loading = false

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeHomepage(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getNested(obj: unknown, path: string): string | undefined {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const part of parts) {
    if (!cur || typeof cur !== 'object' || !(part in cur)) return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : undefined
}

function buildLocaleTexts(lang: LanguageCode): Record<string, string> {
  const file = localeFiles[lang]
  const texts: Record<string, string> = {}
  for (const key of getAllTextKeys()) {
    const value = getNested(file, key)
    if (value) texts[key] = value
  }
  return texts
}

export function createDefaultHomepageState(): HomepageState {
  return {
    layoutVersion: LAYOUT_VERSION,
    sections: { ...defaultSectionEnabled },
    texts: {
      en: buildLocaleTexts('en'),
      bg: buildLocaleTexts('bg'),
      de: buildLocaleTexts('de'),
      fr: buildLocaleTexts('fr'),
    },
    images: getDefaultImages(),
  }
}

function mergeWithDefaults(remote: HomepageState): HomepageState {
  const defaults = createDefaultHomepageState()
  return {
    layoutVersion: remote.layoutVersion ?? LAYOUT_VERSION,
    sections: { ...defaults.sections, ...remote.sections },
    texts: {
      en: { ...defaults.texts.en, ...remote.texts?.en },
      bg: { ...defaults.texts.bg, ...remote.texts?.bg },
      de: { ...defaults.texts.de, ...remote.texts?.de },
      fr: { ...defaults.texts.fr, ...remote.texts?.fr },
    },
    images: { ...defaults.images, ...remote.images },
  }
}

function setState(state: HomepageState) {
  cachedState = state
  emit()
}

export function getHomepageState(): HomepageState {
  if (!cachedState) cachedState = createDefaultHomepageState()
  return cachedState
}

export async function loadHomepage(): Promise<HomepageState> {
  loading = true
  emit()
  try {
    const remote = await homepageApi.get()
    const merged = mergeWithDefaults(remote)
    setState(merged)
    return merged
  } catch {
    const defaults = createDefaultHomepageState()
    setState(defaults)
    return defaults
  } finally {
    loading = false
    emit()
  }
}

async function persistRemote(state: HomepageState) {
  try {
    const saved = await homepageApi.update(state)
    setState(mergeWithDefaults(saved))
  } catch {
    setState(state)
  }
}

export async function resetHomepageState() {
  try {
    const saved = await homepageApi.reset()
    setState(mergeWithDefaults(saved))
  } catch {
    setState(createDefaultHomepageState())
  }
}

export function setSectionEnabled(section: HomepageSectionKey, enabled: boolean) {
  const state = getHomepageState()
  void persistRemote({ ...state, sections: { ...state.sections, [section]: enabled } })
}

export function setHomepageText(lang: LanguageCode, key: string, value: string) {
  const state = getHomepageState()
  void persistRemote({
    ...state,
    texts: { ...state.texts, [lang]: { ...state.texts[lang], [key]: value } },
  })
}

export function setHomepageImage(key: string, url: string) {
  const state = getHomepageState()
  void persistRemote({ ...state, images: { ...state.images, [key]: url } })
}

export function getHomepageText(
  state: HomepageState,
  key: string,
  lang: LanguageCode,
  fallback?: string,
): string {
  return state.texts[lang]?.[key] ?? state.texts.en?.[key] ?? fallback ?? ''
}

export function getHomepageImage(state: HomepageState, key: string, fallback: string): string {
  return state.images[key] || fallback
}

export function interpolate(text: string, vars?: Record<string, string>) {
  if (!vars) return text
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), text)
}

export function getHomepageLoading() {
  return loading
}

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

export type HomepageState = {
  sections: Record<HomepageSectionKey, boolean>
  texts: Record<LanguageCode, Record<string, string>>
  images: Record<string, string>
}

const STORAGE_KEY = 'plantyhub_homepage'
const localeFiles = { en, bg, de, fr } as const
const listeners = new Set<() => void>()

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
  const sections = Object.fromEntries(homepageSectionOrder.map((k) => [k, true])) as Record<
    HomepageSectionKey,
    boolean
  >
  return {
    sections,
    texts: {
      en: buildLocaleTexts('en'),
      bg: buildLocaleTexts('bg'),
      de: buildLocaleTexts('de'),
      fr: buildLocaleTexts('fr'),
    },
    images: getDefaultImages(),
  }
}

let cachedState: HomepageState | null = null

export function getHomepageState(): HomepageState {
  if (cachedState) return cachedState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as HomepageState
      const defaults = createDefaultHomepageState()
      cachedState = {
        sections: { ...defaults.sections, ...parsed.sections },
        texts: {
          en: { ...defaults.texts.en, ...parsed.texts?.en },
          bg: { ...defaults.texts.bg, ...parsed.texts?.bg },
          de: { ...defaults.texts.de, ...parsed.texts?.de },
          fr: { ...defaults.texts.fr, ...parsed.texts?.fr },
        },
        images: { ...defaults.images, ...parsed.images },
      }
      return cachedState
    }
  } catch {
    // fall through
  }
  cachedState = createDefaultHomepageState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedState))
  return cachedState
}

function persist(state: HomepageState) {
  cachedState = state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  emit()
}

export function resetHomepageState() {
  persist(createDefaultHomepageState())
}

export function setSectionEnabled(section: HomepageSectionKey, enabled: boolean) {
  const state = getHomepageState()
  persist({ ...state, sections: { ...state.sections, [section]: enabled } })
}

export function setHomepageText(lang: LanguageCode, key: string, value: string) {
  const state = getHomepageState()
  persist({
    ...state,
    texts: {
      ...state.texts,
      [lang]: { ...state.texts[lang], [key]: value },
    },
  })
}

export function setHomepageImage(key: string, url: string) {
  const state = getHomepageState()
  persist({ ...state, images: { ...state.images, [key]: url } })
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

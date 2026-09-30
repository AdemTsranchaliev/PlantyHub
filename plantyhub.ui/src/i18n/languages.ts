export const supportedLanguages = [
  { code: 'bg', label: 'Български', short: 'BG' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]['code']

export const defaultLanguage: LanguageCode = 'bg'

export const languageStorageKey = 'plantyhub-lang-choice'

/** Region subtag used only when the language subtag is not one we ship. */
const regionLanguage: Record<string, LanguageCode> = {
  bg: 'bg',
  de: 'de',
  at: 'de',
  li: 'de',
  fr: 'fr',
  mc: 'fr',
  us: 'en',
  gb: 'en',
  uk: 'en',
  ie: 'en',
  au: 'en',
  nz: 'en',
  ca: 'en',
  za: 'en',
}

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return supportedLanguages.some((language) => language.code === value)
}

/** First path segment when it is a supported language, ignoring the deploy base path. */
export function localeFromPathname(pathname: string, basePath = ''): LanguageCode | null {
  const base = basePath.replace(/\/$/, '')
  const rest = base && (pathname === base || pathname.startsWith(`${base}/`))
    ? pathname.slice(base.length)
    : pathname
  const segment = rest.split('/').filter(Boolean)[0]
  return isLanguageCode(segment) ? segment : null
}

function tagParts(tag: string): string[] {
  return tag.toLowerCase().replace('_', '-').split('-').filter(Boolean)
}

function isBulgariaTag(tag: string): boolean {
  const parts = tagParts(tag)
  return parts[0] === 'bg' || parts.slice(1).includes('bg')
}

function deviceLanguageTags(): string[] {
  const tags = navigator.languages?.length ? [...navigator.languages] : [navigator.language]
  try {
    const intl = Intl.DateTimeFormat().resolvedOptions().locale
    if (intl) tags.push(intl)
  } catch {
    /* Intl unavailable */
  }
  return tags.filter(Boolean)
}

export function preferredLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(languageStorageKey)
    if (isLanguageCode(saved)) return saved
  } catch {
    /* private mode */
  }

  const tags = deviceLanguageTags()
  if (tags.some(isBulgariaTag)) return defaultLanguage

  for (const tag of tags) {
    const language = tagParts(tag)[0]
    if (isLanguageCode(language)) return language
  }

  for (const tag of tags) {
    const region = tagParts(tag).slice(1).find((part) => /^[a-z]{2}$/.test(part))
    if (region && regionLanguage[region]) return regionLanguage[region]
  }

  return defaultLanguage
}

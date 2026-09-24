export const supportedLanguages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'bg', label: 'Български', short: 'BG' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]['code']

export const defaultLanguage: LanguageCode = 'en'

export const languageStorageKey = 'plantyhub-lang'

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

export function preferredLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(languageStorageKey)
    if (isLanguageCode(saved)) return saved
  } catch {
    /* private mode */
  }

  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    const code = tag?.toLowerCase().split('-')[0]
    if (isLanguageCode(code)) return code
  }

  return defaultLanguage
}

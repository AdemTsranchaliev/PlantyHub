export const supportedLanguages = [
  { code: 'bg', label: 'Български', short: 'BG' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]['code']

/** Languages offered in the switcher. German and French stay in the content model, hidden for now. */
export const activeLanguages = supportedLanguages.filter(
  (language) => language.code === 'bg' || language.code === 'en',
)

export const defaultLanguage: LanguageCode = 'bg'

export const languageStorageKey = 'plantyhub-lang-choice'

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return supportedLanguages.some((language) => language.code === value)
}

export function isActiveLanguage(value: string | null | undefined): value is LanguageCode {
  return activeLanguages.some((language) => language.code === value)
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

/** Saved switcher choice, otherwise Bulgarian. Browser language does not change the site. */
export function preferredLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(languageStorageKey)
    if (isActiveLanguage(saved)) return saved
  } catch {
    /* private mode */
  }

  return defaultLanguage
}

export const supportedLanguages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'bg', label: 'Български', short: 'BG' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]['code']

export const defaultLanguage: LanguageCode = 'en'

export const languageStorageKey = 'plantyhub-lang'

import type { SchoolPack } from './types'

const cache = new Map<string, Promise<SchoolPack>>()

/** Lesson copy stays off the homepage. It loads only when someone opens the school. */
export function loadSchoolPack(language: string | undefined): Promise<SchoolPack> {
  const code = (language ?? 'bg').slice(0, 2)
  const key = code === 'en' || code === 'de' || code === 'fr' ? code : 'bg'
  const existing = cache.get(key)
  if (existing) return existing
  const pending = load(key)
  cache.set(key, pending)
  return pending
}

function load(code: string): Promise<SchoolPack> {
  switch (code) {
    case 'en':
      return import('./en').then((mod) => mod.schoolEn)
    case 'de':
      return import('./de').then((mod) => mod.schoolDe)
    case 'fr':
      return import('./fr').then((mod) => mod.schoolFr)
    default:
      return import('./bg').then((mod) => mod.schoolBg)
  }
}

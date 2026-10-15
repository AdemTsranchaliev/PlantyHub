import type { SchoolPack } from './types'
import { schoolBg } from './bg'
import { schoolDe } from './de'
import { schoolEn } from './en'
import { schoolFr } from './fr'

export const schoolPacks: Record<string, SchoolPack> = {
  bg: schoolBg,
  en: schoolEn,
  de: schoolDe,
  fr: schoolFr,
}

export function schoolPackFor(language: string | undefined): SchoolPack {
  const code = (language ?? 'bg').slice(0, 2)
  return schoolPacks[code] ?? schoolBg
}

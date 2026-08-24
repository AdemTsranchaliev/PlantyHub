export function countryDisplayName(code: string, language = 'bg') {
  const iso = code.trim().toUpperCase()
  if (iso.length !== 2) return code
  try {
    return new Intl.DisplayNames([language], { type: 'region' }).of(iso) ?? iso
  } catch {
    return iso
  }
}

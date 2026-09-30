export function countryDisplayName(code: string, language = 'bg') {
  const iso = code.trim().toUpperCase()
  if (iso.length !== 2) return code
  try {
    return new Intl.DisplayNames([language], { type: 'region' }).of(iso) ?? iso
  } catch {
    return iso
  }
}

export function countryFlag(code: string) {
  const iso = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(iso)) return ''
  return String.fromCodePoint(...iso.split('').map((char) => 0x1f1e6 + char.charCodeAt(0) - 65))
}

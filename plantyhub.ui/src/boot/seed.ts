export type BootSeed = {
  lang?: string
  image?: string
  focus?: string
  price?: string
  texts?: Record<string, string>
}

let cached: BootSeed | null | undefined

/** Homepage facts printed into the first HTML, so React does not guess a different photo or price. */
export function bootSeed(): BootSeed | null {
  if (cached !== undefined) return cached
  cached = null
  if (typeof document === 'undefined') return cached
  const node = document.getElementById('boot-data')
  if (!node?.textContent) return cached
  try {
    const parsed: unknown = JSON.parse(node.textContent)
    if (!parsed || typeof parsed !== 'object') return cached
    cached = parsed as BootSeed
  } catch {
    cached = null
  }
  return cached
}

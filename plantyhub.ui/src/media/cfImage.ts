export type ImagePreset = 'thumb' | 'card' | 'gallery' | 'hero' | 'full'

const PRESETS: Record<ImagePreset, string> = {
  thumb: 'width=240,height=240,fit=cover,format=auto,quality=75',
  card: 'width=720,fit=scale-down,format=auto,quality=80',
  gallery: 'width=1200,fit=scale-down,format=auto,quality=82',
  hero: 'width=1600,fit=scale-down,format=auto,quality=82',
  full: 'width=1920,fit=scale-down,format=auto,quality=85',
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i
const STOCK_GARDEN_VIDEO = /\/videos\/homegarder-one\.mp4(?:[?#]|$)/i

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT.test(url.trim())
}

export function isStockGardenVideo(url: string): boolean {
  return STOCK_GARDEN_VIDEO.test(url.trim())
}

/**
 * The file that should actually play.
 * A video saved in the poster slot is the upload, not a thumbnail.
 */
export function resolveGardenVideo(
  videoUrl?: string | null,
  videoPoster?: string | null,
  fallbackSrc = '',
): { src: string; poster?: string } {
  const url = (videoUrl || '').trim()
  const poster = (videoPoster || '').trim()
  const posterIsVideo = poster.length > 0 && isVideoUrl(poster)
  let src = url
  if (posterIsVideo && (!url || isStockGardenVideo(url))) src = poster
  if (!src) src = fallbackSrc
  const imagePoster = posterIsVideo ? '' : poster
  return {
    src: src ? toMediaUrl(src) : '',
    poster: imagePoster ? toMediaUrl(imagePoster) : undefined,
  }
}

export const MEDIA_ORIGIN = (import.meta.env.VITE_MEDIA_ORIGIN || 'https://media.plantyhub.com').replace(/\/$/, '')

function mediaHost(): string {
  try {
    return new URL(MEDIA_ORIGIN).hostname
  } catch {
    return 'media.plantyhub.com'
  }
}

function stripDeployPrefix(path: string): string {
  if (path.startsWith('/PlantyHub/')) return path.slice('/PlantyHub'.length)
  if (path === '/PlantyHub') return '/'
  return path
}

function isMediaPath(path: string): boolean {
  const value = path.toLowerCase()
  return (
    value.startsWith('/images/')
    || value.startsWith('/videos/')
    || value.startsWith('/uploads/')
    || value.startsWith('/email/')
    || value === '/logo.png'
    || value === '/logo-icon.png'
    || value === '/logo-og.png'
    || value === '/logo-source.png'
    || value === '/favicon.png'
    || value === '/apple-touch-icon.png'
    || value === '/favicon.svg'
    || value === '/icons.svg'
  )
}

function isR2Host(hostname: string): boolean {
  const expected = mediaHost()
  return (
    hostname === expected
    || hostname.endsWith('.r2.dev')
    || hostname.endsWith('.r2.cloudflarestorage.com')
  )
}

/** Public R2 URL for a site file. Same origin in every environment. */
export function toMediaUrl(url: string): string {
  if (!url) return url
  const value = url.trim()
  if (!value || value.startsWith('data:') || value.startsWith('blob:') || value.includes('/cdn-cgi/image/')) return value

  try {
    const parsed = value.startsWith('http://') || value.startsWith('https://')
      ? new URL(value)
      : null
    if (parsed) {
      if (isR2Host(parsed.hostname)) return `${MEDIA_ORIGIN}${parsed.pathname}${parsed.search}`
      const path = stripDeployPrefix(parsed.pathname)
      if (isMediaPath(path)) return `${MEDIA_ORIGIN}${path}${parsed.search}`
      return value
    }
  } catch {
    // fall through to relative handling
  }

  const path = stripDeployPrefix(value.startsWith('/') ? value : `/${value}`)
  return isMediaPath(path) ? `${MEDIA_ORIGIN}${path}` : value
}

/** True when this URL is a public R2 object that can go through /cdn-cgi/image/. */
export function isR2MediaUrl(url: string): boolean {
  const resolved = toMediaUrl(url)
  if (!resolved.startsWith('http://') && !resolved.startsWith('https://')) return false
  if (VIDEO_EXT.test(resolved) || resolved.includes('/cdn-cgi/image/')) return false
  try {
    return isR2Host(new URL(resolved).hostname)
  } catch {
    return false
  }
}

/**
 * Rewrite a public R2 URL onto Cloudflare Image Transformations.
 * Videos and already-transformed URLs are returned unchanged.
 * Store the original R2 URL in the database — never persist a /cdn-cgi/image/ link.
 */
function cfImageUrl(url: string, options: string): string {
  const resolved = toMediaUrl(url)
  if (!resolved || import.meta.env.VITE_CF_IMAGE_TRANSFORMS === 'false' || !isR2MediaUrl(resolved)) return resolved

  try {
    const parsed = new URL(resolved)
    return `${MEDIA_ORIGIN}/cdn-cgi/image/${options}${parsed.pathname}${parsed.search}`
  } catch {
    return resolved
  }
}

export function cfImage(url: string, preset: ImagePreset = 'card'): string {
  return cfImageUrl(url, PRESETS[preset])
}

/** Width cap for files shown far below their pixel size, such as the wordmark. */
export function cfImageWidth(url: string, width: number, quality = 90): string {
  const safe = Math.max(1, Math.round(width))
  return cfImageUrl(url, `width=${safe},fit=scale-down,format=auto,quality=${quality}`)
}

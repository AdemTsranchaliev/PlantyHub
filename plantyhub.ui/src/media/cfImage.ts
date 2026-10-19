export type ImagePreset = 'thumb' | 'card' | 'gallery' | 'hero' | 'full'

const PRESETS: Record<ImagePreset, string> = {
  thumb: 'width=240,height=240,fit=cover,format=auto,quality=75',
  card: 'width=480,fit=scale-down,format=auto,quality=75',
  gallery: 'width=960,fit=scale-down,format=auto,quality=78',
  hero: 'width=960,fit=scale-down,format=auto,quality=75',
  full: 'width=1280,fit=scale-down,format=auto,quality=80',
}

/**
 * Homepage hero candidates. The server paints the same set in the first HTML
 * (PlantyHub.Api/Services/FirstPaint.cs) so the browser does not download the photo twice.
 */
export const HERO_IMAGE = {
  widths: [640, 960, 1280, 1600],
  fallback: 960,
  quality: 75,
  sizes: '(min-width: 900px) 52vw, 100vw',
} as const

const SRCSET: Record<ImagePreset, { widths: readonly number[]; fallback: number; quality: number; sizes: string }> = {
  thumb: { widths: [120, 240], fallback: 240, quality: 75, sizes: '96px' },
  card: { widths: [320, 480, 720], fallback: 480, quality: 75, sizes: '(min-width: 900px) 280px, min(78vw, 260px)' },
  gallery: { widths: [480, 640, 720, 960, 1200], fallback: 720, quality: 75, sizes: '(min-width: 900px) 46vw, calc(100vw - 32px)' },
  hero: { widths: HERO_IMAGE.widths, fallback: HERO_IMAGE.fallback, quality: HERO_IMAGE.quality, sizes: '100vw' },
  full: { widths: [960, 1280, 1920], fallback: 1280, quality: 80, sizes: '100vw' },
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

export function cfImageSet(url: string, preset: ImagePreset = 'card'): { src: string; srcSet?: string; sizes?: string } {
  const resolved = toMediaUrl(url)
  const spec = SRCSET[preset]
  if (!resolved || import.meta.env.VITE_CF_IMAGE_TRANSFORMS === 'false' || !isR2MediaUrl(resolved)) {
    return { src: resolved }
  }
  const options = (width: number) => `width=${width},fit=scale-down,format=auto,quality=${spec.quality}`
  return {
    src: cfImageUrl(resolved, options(spec.fallback)),
    srcSet: spec.widths.map((width) => `${cfImageUrl(resolved, options(width))} ${width}w`).join(', '),
    sizes: spec.sizes,
  }
}

/** Width cap for files shown far below their pixel size, such as the wordmark. */
export function cfImageWidth(url: string, width: number, quality = 75): string {
  const safe = Math.max(1, Math.round(width))
  return cfImageUrl(url, `width=${safe},fit=scale-down,format=auto,quality=${quality}`)
}

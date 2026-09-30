export type FocusPoint = { x: number; y: number }

export type ImageFrame = {
  id: string
  labelKey: string
  aspectRatio: string
  fallback: FocusPoint
}

const FOCUS_SUFFIX = '.focus'
const center: FocusPoint = { x: 50, y: 50 }

export function imageFocusKey(imageKey: string) {
  return `${imageKey}${FOCUS_SUFFIX}`
}

export function framesForImageKey(key: string): ImageFrame[] {
  if (key === 'hero.main') {
    return [
      { id: 'mobile', labelKey: 'admin.imagePicker.frames.mobile', aspectRatio: '3 / 2', fallback: { x: 50, y: 42 } },
      { id: 'desktop', labelKey: 'admin.imagePicker.frames.desktop', aspectRatio: '4 / 3', fallback: { x: 58, y: 50 } },
    ]
  }
  if (key === 'growSmarter.main') {
    return [{ id: 'main', labelKey: 'admin.imagePicker.frames.desktop', aspectRatio: '4 / 5', fallback: center }]
  }
  if (key === 'product.main') {
    return [
      { id: 'mobile', labelKey: 'admin.imagePicker.frames.mobile', aspectRatio: '16 / 10', fallback: center },
      { id: 'desktop', labelKey: 'admin.imagePicker.frames.desktop', aspectRatio: '1 / 1', fallback: center },
    ]
  }
  if (key.startsWith('socialProof.')) {
    return [{ id: 'card', labelKey: 'admin.imagePicker.frames.card', aspectRatio: '3 / 1', fallback: center }]
  }
  if (key === 'cta.main') {
    return [{ id: 'main', labelKey: 'admin.imagePicker.frames.desktop', aspectRatio: '4 / 3', fallback: center }]
  }
  if (key.startsWith('blog.')) {
    return [
      { id: 'card', labelKey: 'admin.imagePicker.frames.card', aspectRatio: '16 / 9', fallback: center },
      { id: 'article', labelKey: 'admin.imagePicker.frames.article', aspectRatio: '16 / 10', fallback: { x: 50, y: 40 } },
      { id: 'related', labelKey: 'admin.imagePicker.frames.related', aspectRatio: '4 / 3', fallback: center },
    ]
  }
  if (key === 'about.hero') {
    return [{ id: 'main', labelKey: 'admin.imagePicker.frames.page', aspectRatio: '4 / 3', fallback: { x: 50, y: 42 } }]
  }
  if (key.startsWith('pdp.gallery.')) {
    return [{ id: 'main', labelKey: 'admin.imagePicker.frames.gallery', aspectRatio: '1 / 1', fallback: center }]
  }
  return []
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 50
  return Math.min(100, Math.max(0, value))
}

export function formatFocusPoint(point: FocusPoint) {
  const x = Math.round(clampPercent(point.x))
  const y = Math.round(clampPercent(point.y))
  return `${x}% ${y}%`
}

function parseFocusPoint(value: unknown, fallback: FocusPoint): FocusPoint {
  if (typeof value !== 'string') return fallback
  const match = value.trim().match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/)
  if (!match) return fallback
  return { x: clampPercent(Number(match[1])), y: clampPercent(Number(match[2])) }
}

export function parseImageFocus(raw: string | undefined, frames: ImageFrame[]): Record<string, FocusPoint> {
  let stored: Record<string, unknown> = {}
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') stored = parsed as Record<string, unknown>
    } catch {
      stored = {}
    }
  }
  const focus: Record<string, FocusPoint> = {}
  for (const frame of frames) {
    focus[frame.id] = parseFocusPoint(stored[frame.id], frame.fallback)
  }
  return focus
}

export function serializeImageFocus(focus: Record<string, FocusPoint>) {
  const stored: Record<string, string> = {}
  for (const [id, point] of Object.entries(focus)) stored[id] = formatFocusPoint(point)
  return JSON.stringify(stored)
}

export function objectPositionForKey(images: Record<string, string>, imageKey: string, frameId: string) {
  const frames = framesForImageKey(imageKey)
  const frame = frames.find((item) => item.id === frameId) ?? frames[0]
  if (!frame) return '50% 50%'
  const focus = parseImageFocus(images[imageFocusKey(imageKey)], frames)
  return formatFocusPoint(focus[frame.id] ?? frame.fallback)
}

export function responsiveObjectPosition(images: Record<string, string>, imageKey: string, mobileId: string, desktopId: string) {
  return {
    xs: objectPositionForKey(images, imageKey, mobileId),
    md: objectPositionForKey(images, imageKey, desktopId),
  }
}

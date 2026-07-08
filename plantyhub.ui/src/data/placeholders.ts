type PlantPlaceholderOptions = {
  label: string
  width?: number
  height?: number
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Inline SVG plant placeholder — swap for real photos in images.ts later */
export function plantPlaceholder({ label, width = 800, height = 800 }: PlantPlaceholderOptions): string {
  const bg = '#E8E5DA'
  const bgLight = '#f3f1ea'
  const green = '#4CAF50'
  const greenDark = '#3d8b40'
  const dark = '#2B2B2B'
  const cx = width / 2
  const cy = height / 2 - height * 0.06
  const titleSize = Math.max(14, Math.min(width, height) * 0.048)
  const subSize = Math.max(11, Math.min(width, height) * 0.028)
  const plantScale = Math.min(width, height) * 0.14

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgLight}"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${green}" opacity="0.12"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#dots)"/>
  <circle cx="${width * 0.15}" cy="${height * 0.2}" r="${plantScale * 0.9}" fill="${green}" opacity="0.08"/>
  <circle cx="${width * 0.85}" cy="${height * 0.75}" r="${plantScale * 1.1}" fill="${greenDark}" opacity="0.07"/>
  <g transform="translate(${cx}, ${cy}) scale(${plantScale / 50})">
    <ellipse cx="0" cy="42" rx="34" ry="11" fill="${greenDark}" opacity="0.2"/>
    <path d="M0 42 C-4 20 -3 0 0 -58 C3 0 4 20 0 42 Z" fill="${green}"/>
    <path d="M0 18 C-42 4 -58 -28 -52 -48 C-24 -26 -6 8 0 18 Z" fill="${greenDark}" opacity="0.85"/>
    <path d="M0 18 C42 4 58 -28 52 -48 C24 -26 6 8 0 18 Z" fill="${greenDark}" opacity="0.85"/>
    <path d="M0 28 C-28 18 -38 0 -34 -16 C-16 2 -2 18 0 28 Z" fill="${green}" opacity="0.75"/>
    <path d="M0 28 C28 18 38 0 34 -16 C16 2 2 18 0 28 Z" fill="${green}" opacity="0.75"/>
  </g>
  <rect x="${width * 0.08}" y="${height * 0.78}" width="${width * 0.84}" height="1" fill="${green}" opacity="0.2"/>
  <text x="${cx}" y="${height * 0.72}" text-anchor="middle" font-family="Nunito Sans, system-ui, sans-serif" font-size="${titleSize}" font-weight="700" fill="${dark}">${escapeXml(label)}</text>
  <text x="${cx}" y="${height * 0.72 + titleSize * 1.45}" text-anchor="middle" font-family="Nunito Sans, system-ui, sans-serif" font-size="${subSize}" font-weight="600" fill="${dark}" opacity="0.45">Plant placeholder · ${width}×${height}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const placeholders = {
  heroKitchen: plantPlaceholder({ label: 'Hero · Kitchen Garden', width: 1920, height: 1080 }),
  gardenDevice: plantPlaceholder({ label: 'Smart Garden Device', width: 1200, height: 900 }),
  herbsGrowing: plantPlaceholder({ label: 'Herbs Growing', width: 1000, height: 1000 }),
  hydroponic: plantPlaceholder({ label: 'Hydroponic System', width: 1000, height: 1000 }),
  indoorGarden: plantPlaceholder({ label: 'Indoor Garden', width: 1000, height: 1000 }),
  strawberries: plantPlaceholder({ label: 'Strawberries', width: 800, height: 800 }),
  basil: plantPlaceholder({ label: 'Basil', width: 800, height: 800 }),
  mint: plantPlaceholder({ label: 'Mint', width: 800, height: 800 }),
  lettuce: plantPlaceholder({ label: 'Lettuce', width: 800, height: 800 }),
  spinach: plantPlaceholder({ label: 'Spinach', width: 800, height: 800 }),
  herbMix: plantPlaceholder({ label: 'Herb Mix', width: 800, height: 800 }),
  pesto: plantPlaceholder({ label: 'Basil Pesto', width: 900, height: 600 }),
  accessories: plantPlaceholder({ label: 'Accessories', width: 800, height: 800 }),
  tray: plantPlaceholder({ label: 'Pod Tray', width: 800, height: 800 }),
  avatar: (name: string) => plantPlaceholder({ label: name, width: 200, height: 200 }),
} as const

/** Repo subpath on GitHub Pages, e.g. `/PlantyHub`. Empty when served from domain root. */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Prefix absolute in-app links with the deploy base path (anchors and plain hrefs). */
export function resolveHref(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  return `${BASE_PATH}${href}`
}

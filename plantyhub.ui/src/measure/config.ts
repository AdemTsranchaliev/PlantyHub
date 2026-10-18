/**
 * IDs are baked in at build time. Empty values leave that tool off.
 * GA4, Meta and Clarity belong in the GTM container. Keep their IDs empty here.
 */
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim()
export const GTM_ID = (import.meta.env.VITE_GTM_ID ?? '').trim()
export const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID ?? '').trim()
export const CLARITY_PROJECT_ID = (import.meta.env.VITE_CLARITY_PROJECT_ID ?? '').trim()

export const analyticsEnabled = /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID)
export const gtmEnabled = /^GTM-[A-Z0-9]+$/i.test(GTM_ID)
export const metaPixelEnabled = /^\d{6,20}$/.test(META_PIXEL_ID)
export const clarityEnabled = /^[a-z0-9]{4,32}$/i.test(CLARITY_PROJECT_ID)

/** Cookie banner and footer settings appear when any of these tools is configured. */
export const trackingEnabled = analyticsEnabled || gtmEnabled || metaPixelEnabled || clarityEnabled

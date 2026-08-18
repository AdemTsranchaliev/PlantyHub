const configured = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

/** In dev, always use the Vite proxy (same origin). In production, use VITE_API_URL. */
export const API_URL = import.meta.env.DEV ? '' : configured

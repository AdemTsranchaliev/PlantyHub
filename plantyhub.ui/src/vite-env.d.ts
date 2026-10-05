/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MEDIA_ORIGIN?: string
  readonly VITE_CF_IMAGE_TRANSFORMS?: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_GTM_ID?: string
  readonly VITE_META_PIXEL_ID?: string
  readonly VITE_CLARITY_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

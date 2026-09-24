/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MEDIA_ORIGIN?: string
  readonly VITE_CF_IMAGE_TRANSFORMS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

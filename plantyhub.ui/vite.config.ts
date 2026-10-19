import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'non-blocking-css',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(
            /<link rel="stylesheet"([^>]*)>/g,
            (tag) => {
              if (tag.includes('media=')) return tag
              const href = tag.match(/href="([^"]+)"/)?.[1] ?? ''
              return `${tag.replace('<link', '<link media="print" onload="this.media=\'all\'"')}<noscript><link rel="stylesheet" href="${href}"></noscript>`
            },
          )
        },
      },
    },
  ],
  build: {
    // The entry preloads its graph from the first HTML. That download was racing the hero photo.
    modulePreload: false,
  },
  base: process.env.VITE_BASE || '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5281',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5281',
        changeOrigin: true,
      },
    },
  },
})

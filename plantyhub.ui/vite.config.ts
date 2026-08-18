import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/PlantyHub/' : '/',
  server: {
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
}))

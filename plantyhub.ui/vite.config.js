import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
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
});

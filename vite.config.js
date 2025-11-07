import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite acceso desde la red local
    port: 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      'qr-scanner': resolve(__dirname, 'node_modules/qr-scanner')
    }
  },
  optimizeDeps: {
    include: ['qr-scanner']
  }
})

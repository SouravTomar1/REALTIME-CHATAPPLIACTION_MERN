import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://43.204.116.254',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://43.204.116.254',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
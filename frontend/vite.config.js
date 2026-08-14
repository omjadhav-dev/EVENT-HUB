import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: "http://localhost:7070",
        changeOrigin: true,
      },
      '/socket.io': {
        target: "http://localhost:7070",
        changeOrigin: true,
        ws: true,
      }
    }
  },
  plugins: [
    tailwindcss(),
  ],
})
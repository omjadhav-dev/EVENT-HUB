import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': "https://localhost:7070"
    }
  },
  plugins: [
    tailwindcss(),
  ],
})
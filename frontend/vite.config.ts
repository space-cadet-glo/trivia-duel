import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/start-game': {
        target: 'https://trivia-duel.pages.dev',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
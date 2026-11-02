import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH is only needed when the site is served from a sub folder
// (GitHub Pages project sites: /DailyJournal/). Leave it empty for the root.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // the journal API lives on the FastAPI backend (../backend/main.py).
    // Proxying it here means the browser never needs CORS in development.
    proxy: {
      '/journal': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

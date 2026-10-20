import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remotion + React bundle is ~590 KB (~180 KB gzipped); fine for this one-page site
  build: { chunkSizeWarningLimit: 700 },
})

import * as path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Pages from 'vite-plugin-pages'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
  plugins: [
    react(),
    Pages({
      pagesDir: "src/pages",
      importMode() {
        return 'sync'
      },
    }),
  ],
})

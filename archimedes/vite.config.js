import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/3nw/',
  build: {
    emptyOutDir: true,
    cssCodeSplit: false, // Bundle all CSS into one file
    assetsInlineLimit: 10240, // Inline files smaller than 10kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group all node_modules into a single vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Group all components and composables into a single bundle
          if (id.includes('src/components/') || id.includes('src/composables/')) {
            return 'components';
          }
          // Group all lessons/data
          if (id.includes('src/lessons/') || id.includes('src/data/')) {
            return 'data';
          }
        }
      }
    }
  }
})


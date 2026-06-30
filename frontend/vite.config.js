import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-chartjs';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animations';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            return 'vendor-others';
          }
          if (id.includes('/src/pages/hospital/')) {
            return 'page-hospital';
          }
          if (id.includes('/src/pages/admin/')) {
            return 'page-admin';
          }
          if (id.includes('/src/pages/district/')) {
            return 'page-district';
          }
          if (id.includes('/src/pages/state/')) {
            return 'page-state';
          }
          if (id.includes('/src/pages/systemadmin/')) {
            return 'page-systemadmin';
          }
          if (id.includes('/src/components/')) {
            return 'components-common';
          }
        }
      }
    }
  }
})

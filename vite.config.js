import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Ensure proper chunk naming and cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          storage: ['react-secure-storage'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-popover', 'react-day-picker', 'sonner'],
          forms: ['formik', 'yup'],
          dates: ['dayjs', 'moment'],
          maps: ['@geoapify/geocoder-autocomplete', '@geoapify/react-geocoder-autocomplete']
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

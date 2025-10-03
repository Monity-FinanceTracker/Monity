import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Configuração de manual chunks para otimização de bundle
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React core together to avoid scheduler issues with React 19
          if (id.includes('node_modules')) {
            // Core React libraries - don't split to avoid scheduler conflicts
            if (id.includes('react') && !id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            
            // Other vendor libraries
            if (id.includes('@tanstack') || id.includes('@supabase') || 
                id.includes('react-router-dom') || id.includes('axios')) {
              return 'vendor';
            }
            
            // UI and utility libraries
            if (id.includes('lucide-react') || id.includes('react-icons') || 
                id.includes('lodash') || id.includes('date-fns') || 
                id.includes('i18next') || id.includes('react-chartjs-2')) {
              return 'ui-vendor';
            }
            
            // Everything else
            return 'vendor';
          }
        },
        // Configuração de chunk names para melhor organização
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '')
            : 'chunk'
          return `js/[name]-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    // Configurações de otimização
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    // Limite de tamanho de chunk para forçar code splitting
    chunkSizeWarningLimit: 500,
    // Configurações de CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: [
      'react-chartjs-2'
    ]
  },
  // React 19 compatibility fixes
  define: {
    global: 'globalThis',
  }
})

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
          // Core React libraries
          if (id.includes('react') && id.includes('node_modules')) {
            if (id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'react-vendor';
          }
          
          // Routing
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          
          // State management
          if (id.includes('@tanstack/react-query')) {
            return 'state';
          }
          
          // Supabase
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          
          // Charts
          if (id.includes('react-chartjs-2') || id.includes('chart.js')) {
            return 'charts';
          }
          
          // Internationalization
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          
          // UI libraries
          if (id.includes('lucide-react') || id.includes('react-icons')) {
            return 'ui';
          }
          
          // Forms
          if (id.includes('react-toastify')) {
            return 'forms';
          }
          
          // Virtualization
          if (id.includes('react-window')) {
            return 'virtualization';
          }
          
          // HTTP client
          if (id.includes('axios')) {
            return 'http';
          }
          
          // Utilities
          if (id.includes('lodash') || id.includes('date-fns')) {
            return 'utils';
          }
          
          // Analytics
          if (id.includes('@vercel') || id.includes('web-vitals')) {
            return 'analytics';
          }
          
          // Vendor libraries
          if (id.includes('node_modules')) {
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
  }
})

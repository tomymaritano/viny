/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Disable PWA for Electron builds to improve performance
    ...(process.env.TARGET !== 'electron' ? [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'favicon.svg'],
        manifest: {
          name: 'Viny - Markdown Editor',
          short_name: 'Viny',
          description: 'Professional markdown editor with live preview, note organization, and export capabilities',
          theme_color: '#002B36',
          background_color: '#00141A',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000 // 5MB
        }
      })
    ] : [])
  ],
  base: './',
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      external: ['electron'],
      output: {
        manualChunks: (id) => {
          // Group dependencies by type for better caching
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            
            // Monaco Editor - large dependency
            if (id.includes('monaco-editor') || id.includes('@monaco-editor')) {
              return 'monaco'
            }
            
            // CodeMirror - large dependency
            if (id.includes('@codemirror') || id.includes('codemirror')) {
              return 'codemirror'
            }
            
            // Highlight.js languages - split per language for dynamic loading
            if (id.includes('highlight.js/lib/languages/')) {
              const lang = id.match(/languages\/([^.]+)/)?.[1] || 'unknown'
              return `hljs-${lang}`
            }
            
            // Core highlight.js
            if (id.includes('highlight.js')) {
              return 'highlight-core'
            }
            
            // Markdown processing
            if (id.includes('markdown-it') || id.includes('marked') || id.includes('remark') || id.includes('rehype')) {
              return 'markdown'
            }
            
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation'
            }
            
            // Search and utilities
            if (id.includes('fuse.js') || id.includes('dompurify')) {
              return 'search-utils'
            }
            
            // State management
            if (id.includes('zustand')) {
              return 'state'
            }
            
            // Large UI libraries
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            
            // Everything else goes to vendor
            return 'vendor'
          }
          
          // App code splitting
          if (id.includes('/src/')) {
            // Components
            if (id.includes('/components/')) {
              if (id.includes('/settings/')) {
                return 'settings'
              }
              if (id.includes('/editor/')) {
                return 'editor'
              }
              if (id.includes('/features/')) {
                return 'features'
              }
              return 'components'
            }
            
            // Hooks
            if (id.includes('/hooks/')) {
              return 'hooks'
            }
            
            // Stores
            if (id.includes('/stores/')) {
              return 'stores'
            }
            
            // Utils and config
            if (id.includes('/utils/') || id.includes('/config/') || id.includes('/lib/')) {
              return 'utils'
            }
          }
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Increase chunk size warning limit for expected large chunks
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/**/*.{js,jsx,ts,tsx}'
      ],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/__tests__/',
        'src/**/__tests__/',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        '**/*.d.ts',
        'src/main.tsx',
        'src/AppSimple.tsx',
        'src/SettingsStandalone.tsx',
        'src/components/LazyComponents.tsx',
        'src/types/',
        'src/constants/',
        'dist/',
        'dist-electron/',
        'electron/',
        'scripts/',
        'server/',
        'public/',
        'docs/',
        '*.config.js',
        'start-dev*.js'
      ],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50
        },
        'src/components/**/*.{js,jsx}': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60
        },
        'src/hooks/**/*.js': {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
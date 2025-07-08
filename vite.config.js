/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'Nototo - Markdown Editor',
        short_name: 'Nototo',
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
  ],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['electron']
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'vite.config.js',
        'tailwind.config.js',
        'postcss.config.js',
        'dist/',
        'dist-electron/',
        'electron/',
        'scripts/',
        'examples/',
        'public/examples/',
        'server/',
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
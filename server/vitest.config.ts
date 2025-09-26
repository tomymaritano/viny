/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup-simple.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'prisma/migrations'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}',
        'src/types.ts',
        'src/index.ts', // Server entry point
        'dist/',
        'prisma/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        'src/services/**/*.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/controllers/**/*.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    // Increase timeout for database operations
    testTimeout: 10000,
    // Run tests sequentially to avoid database conflicts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@test': resolve(__dirname, 'src/test')
    }
  }
})
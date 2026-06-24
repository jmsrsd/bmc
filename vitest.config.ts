import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./app/__tests__/setup.ts'],
    globals: true,
    include: ['app/**/*.{test,spec}.{ts,tsx}', 'lib/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/__tests__/**',
        'app/globals.css',
        'app/layout.tsx',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
    testTimeout: 10_000,
    retry: 0,
  },
  resolve: {
    alias: {
      '@prisma/client': path.resolve(__dirname, '__mocks__/@prisma/client.ts'),
      '@': path.resolve(__dirname, '.'),
      '@app': path.resolve(__dirname, 'app'),
      '@components': path.resolve(__dirname, 'app/components'),
      '@/components': path.resolve(__dirname, 'app/components'),
      '@lib': path.resolve(__dirname, 'app/lib'),
      '@prisma': path.resolve(__dirname, 'prisma'),
    },
  },
})
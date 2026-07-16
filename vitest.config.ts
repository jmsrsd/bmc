import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['app/**/*.{test,spec}.{ts,tsx}', 'lib/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      exclude: [
        'app/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        '**/*.d.ts',
        'lib/prisma.ts',
        'app/api/stream/**',
        'app/(dashboard)/fire/**',
        'app/(dashboard)/elevators/**',
        'app/(dashboard)/building/**',
        'app/(dashboard)/alarms/**',
        'app/(dashboard)/energy/**',
        'app/components/sidebar-context.tsx',
        'app/components/app-sidebar.tsx',
        'app/components/ui/data-table.tsx',
        'app/components/ui/index.ts',
        'app/loading.tsx',
        'app/not-found.tsx',
        'app/error.tsx',
        'app/page.tsx',
        'app/**/page.tsx',
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
    alias: [
      { find: '@/components', replacement: path.resolve(__dirname, 'app/components') },
      { find: '@app', replacement: path.resolve(__dirname, 'app') },
      { find: '@', replacement: path.resolve(__dirname, '.') },
    ],
  },
})
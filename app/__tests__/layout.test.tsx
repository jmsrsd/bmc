import { describe, it, expect, vi } from 'vitest'

vi.mock('next/font/google', async () => ({
  Inter: async () => ({
    variable: '--font-inter',
    className: 'font-inter',
    style: {},
  }),
  JetBrains_Mono: async () => ({
    variable: '--font-jetbrains-mono',
    className: 'font-jetbrains-mono',
    style: {},
  }),
}))

describe('app/layout.tsx - pure exports', () => {
  it('exports metadata', async () => {
    const { metadata } = await import('../layout.tsx')
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('BMC — Biomedical Campus')
    expect(metadata.description).toBe('Building Management Campus — real-time monitoring and control')
  })

  it('metadata has required fields', async () => {
    const { metadata } = await import('../layout.tsx')
    expect(typeof metadata.title).toBe('string')
    expect(typeof metadata.description).toBe('string')
    expect(metadata.title.length).toBeGreaterThan(0)
    expect(metadata.description.length).toBeGreaterThan(0)
  })
})
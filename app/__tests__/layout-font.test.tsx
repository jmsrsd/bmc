import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({
    variable: '--font-inter',
    className: 'font-inter',
  })),
  JetBrains_Mono: vi.fn(() => ({
    variable: '--font-jetbrains-mono',
    className: 'font-jetbrains-mono',
  })),
}))

describe('app/layout.tsx - root layout', () => {
  it('exports RootLayout component', async () => {
    const { default: RootLayout } = await import('../layout.tsx')
    expect(RootLayout).toBeDefined()
    expect(typeof RootLayout).toBe('function')
  })

  it('exports metadata', async () => {
    const { metadata } = await import('../layout.tsx')
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('BMC — Biomedical Campus')
  })

  it('renders html with dark class and font variables', async () => {
    const { default: RootLayout } = await import('../layout.tsx')
    const html = renderToString(<RootLayout children={<p>Test</p>} />)
    expect(html).toContain('lang="en"')
    expect(html).toContain('class="dark"')
    expect(html).toContain('--font-inter')
    expect(html).toContain('--font-jetbrains-mono')
    expect(html).toContain('Test')
  })
})
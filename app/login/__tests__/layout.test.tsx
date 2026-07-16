import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import LoginLayout, { metadata } from '../layout.tsx'

describe('app/login/layout.tsx', () => {
  it('exports metadata', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Login — BMC')
  })

  it('renders children in centered container', () => {
    const html = renderToString(<LoginLayout><p>Test content</p></LoginLayout>)
    expect(html).toContain('Test content')
    expect(html).toContain('min-h-screen')
    expect(html).toContain('flex')
    expect(html).toContain('items-center')
    expect(html).toContain('justify-center')
  })
})
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...rest }: any) =>
    React.createElement('a', { ...rest, href, className }, children),
}))

import NotFoundPage from '../not-found'

describe('Not Found page', () => {
  it('renders 404 heading', () => {
    const html = renderToString(React.createElement(NotFoundPage))
    expect(html).toContain('404')
  })

  it('renders Page not found message', () => {
    const html = renderToString(React.createElement(NotFoundPage))
    expect(html).toContain('Page not found')
  })

  it('renders link back to /building', () => {
    const html = renderToString(React.createElement(NotFoundPage))
    expect(html).toContain('Return to building')
    expect(html).toContain('href="/building"')
  })

  it('link has active styling class', () => {
    const html = renderToString(React.createElement(NotFoundPage))
    expect(html).toContain('text-active')
    expect(html).toContain('hover:underline')
  })

  it('renders full page centered layout', () => {
    const html = renderToString(React.createElement(NotFoundPage))
    expect(html).toContain('min-h-screen')
    expect(html).toContain('text-center')
  })
})

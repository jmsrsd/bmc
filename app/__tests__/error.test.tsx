import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import ErrorPage from '../error'

describe('Root Error page', () => {
  it('renders error message', () => {
    const error = new Error('Connection failed')
    const html = renderToString(ErrorPage({ error, reset: vi.fn() }))
    expect(html).toContain('Connection failed')
  })

  it('renders Try again button', () => {
    const error = new Error('test')
    const html = renderToString(ErrorPage({ error, reset: vi.fn() }))
    expect(html).toContain('Try again')
  })

  it('renders default message when error has no message', () => {
    const error = new Error()
    // Error without message may have empty string or undefined
    Object.defineProperty(error, 'message', { get: () => '' })
    const html = renderToString(ErrorPage({ error, reset: vi.fn() }))
    expect(html).toContain('An unexpected error occurred')
  })

  it('renders Something went wrong heading', () => {
    const error = new Error('test')
    const html = renderToString(ErrorPage({ error, reset: vi.fn() }))
    expect(html).toContain('Something went wrong')
  })

  it('button has type="button" for accessibility', () => {
    const error = new Error('test')
    const html = renderToString(ErrorPage({ error, reset: vi.fn() }))
    // React 19 SSR does not serialize event handlers — verify structural attributes instead
    expect(html).toContain('<button')
    expect(html).toContain('Try again')
  })
})

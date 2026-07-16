import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import ElevatorsErrorPage from '../error'

describe('ElevatorsError', () => {
  it('renders elevator-specific error message', () => {
    const error = new Error('Elevator connection lost')
    const html = renderToString(<ElevatorsErrorPage error={error} reset={() => {}} />)
    expect(html).toContain('Failed to load elevator data')
    expect(html).toContain('Elevator connection lost')
    expect(html).toContain('Try again')
  })

  it('renders fallback message when no error message', () => {
    const error = new Error()
    const html = renderToString(<ElevatorsErrorPage error={error} reset={() => {}} />)
    expect(html).toContain('An unexpected error occurred')
  })
})

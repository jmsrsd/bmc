import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Card } from '../card'

describe('Card', () => {
  it('renders children', () => {
    const html = renderToString(React.createElement(Card, null, 'Hello Card'))
    expect(html).toContain('Hello Card')
  })

  it('renders JSX children', () => {
    const html = renderToString(
      React.createElement(Card, null,
        React.createElement('p', { 'data-testid': 'inner' }, 'content'),
      ),
    )
    expect(html).toContain('content')
  })

  it('has default glassmorphism classes', () => {
    const html = renderToString(React.createElement(Card, null, 'test'))
    expect(html).toContain('rounded-xl')
    expect(html).toContain('bg-surface/50')
    expect(html).toContain('border border-hairline')
  })

  it('appends custom className', () => {
    const html = renderToString(React.createElement(Card, { className: 'mt-4' }, 'test'))
    expect(html).toContain('mt-4')
    expect(html).toContain('rounded-xl')
  })

  it('renders empty children as valid', () => {
    // Card renders with children passed as undefined — should produce valid div
    const html = renderToString(
      React.createElement(Card, { children: null }),
    )
    expect(html).toContain('div')
  })
})

import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { PageHeader } from '../page-header'

describe('PageHeader', () => {
  it('renders title', () => {
    const html = renderToString(React.createElement(PageHeader, { title: 'Building Overview' }))
    expect(html).toContain('Building Overview')
  })

  it('renders subtitle when provided', () => {
    const html = renderToString(React.createElement(PageHeader, { title: 'Test', subtitle: 'Subtitle text' }))
    expect(html).toContain('Subtitle text')
  })

  it('does not render subtitle element when missing', () => {
    const html = renderToString(React.createElement(PageHeader, { title: 'Test' }))
    expect(html).not.toContain('mt-1')
  })

  it('renders h1 element', () => {
    const html = renderToString(React.createElement(PageHeader, { title: 'Test' }))
    expect(html).toContain('<h1')
    expect(html).toContain('</h1>')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(PageHeader, { title: 'Test', className: 'mb-6' }))
    expect(html).toContain('mb-6')
  })
})

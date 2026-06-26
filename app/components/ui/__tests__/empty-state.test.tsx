import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { EmptyState, SectionEmpty } from '../empty-state'

describe('EmptyState', () => {
  it('renders default message', () => {
    const html = renderToString(React.createElement(EmptyState))
    expect(html).toContain('Building not found')
  })

  it('renders custom message', () => {
    const html = renderToString(React.createElement(EmptyState, { message: 'No data available' }))
    expect(html).toContain('No data available')
  })

  it('renders centered layout', () => {
    const html = renderToString(React.createElement(EmptyState))
    expect(html).toContain('justify-center')
    expect(html).toContain('min-h-')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(EmptyState, { className: 'mt-8' }))
    expect(html).toContain('mt-8')
  })
})

describe('SectionEmpty', () => {
  it('renders message', () => {
    const html = renderToString(React.createElement(SectionEmpty, { message: 'No zones configured' }))
    expect(html).toContain('No zones configured')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(SectionEmpty, { message: 'Empty', className: 'ml-4' }))
    expect(html).toContain('ml-4')
  })
})

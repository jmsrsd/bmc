import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renders children text', () => {
    const html = renderToString(React.createElement(Badge, null, 'Active'))
    expect(html).toContain('Active')
  })

  it('defaults to neutral variant', () => {
    const html = renderToString(React.createElement(Badge, null, 'test'))
    expect(html).toContain('bg-[#242427]')
    expect(html).toContain('text-[#AEAEB2]')
  })

  it('renders critical variant', () => {
    const html = renderToString(React.createElement(Badge, { variant: 'critical' }, 'Critical'))
    expect(html).toContain('bg-[#FF453A]')
  })

  it('renders warning variant', () => {
    const html = renderToString(React.createElement(Badge, { variant: 'warning' }, 'Warning'))
    expect(html).toContain('bg-[#FF9F0A]')
  })

  it('renders normal variant', () => {
    const html = renderToString(React.createElement(Badge, { variant: 'normal' }, 'Normal'))
    expect(html).toContain('bg-[#32D74B]')
  })

  it('renders active variant', () => {
    const html = renderToString(React.createElement(Badge, { variant: 'active' }, 'Active'))
    expect(html).toContain('bg-[#0A84FF]')
  })

  it('renders rounded-full inline-flex span', () => {
    const html = renderToString(React.createElement(Badge, null, 'test'))
    expect(html).toContain('rounded-full')
    expect(html).toContain('inline-flex')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Badge, { className: 'ml-2' }, 'test'))
    expect(html).toContain('ml-2')
  })
})

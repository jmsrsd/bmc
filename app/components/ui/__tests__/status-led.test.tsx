import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { StatusLed } from '../status-led'

describe('StatusLed', () => {
  it('renders with normal status', () => {
    const html = renderToString(React.createElement(StatusLed, { status: 'normal' }))
    expect(html).toContain('#32D74B')
    expect(html).toContain('Status: normal')
  })

  it('renders with warning status', () => {
    const html = renderToString(React.createElement(StatusLed, { status: 'warning' }))
    expect(html).toContain('#FF9F0A')
    expect(html).toContain('Status: warning')
  })

  it('renders with critical status', () => {
    const html = renderToString(React.createElement(StatusLed, { status: 'critical' }))
    expect(html).toContain('#FF453A')
    expect(html).toContain('Status: critical')
  })

  it('renders with active status', () => {
    const html = renderToString(React.createElement(StatusLed, { status: 'active' }))
    expect(html).toContain('#0A84FF')
    expect(html).toContain('Status: active')
  })

  it('renders with unknown status (gray)', () => {
    const html = renderToString(React.createElement(StatusLed, { status: 'unknown' }))
    expect(html).toContain('#8E8E93')
    expect(html).toContain('Status: unknown')
  })

  it('renders inline-block rounded-full span', () => {
    const html = renderToString(React.createElement(StatusLed, { status: 'normal' }))
    expect(html).toContain('inline-block')
    expect(html).toContain('rounded-full')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(StatusLed, { status: 'normal', className: 'mr-2' }))
    expect(html).toContain('mr-2')
  })
})

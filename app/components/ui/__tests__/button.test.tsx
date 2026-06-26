import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Button } from '../button'

describe('Button', () => {
  it('renders children', () => {
    const html = renderToString(React.createElement(Button, null, 'Click me'))
    expect(html).toContain('Click me')
  })

  it('defaults to primary variant', () => {
    const html = renderToString(React.createElement(Button, null, 'test'))
    expect(html).toContain('bg-[#0A84FF]')
  })

  it('renders danger variant', () => {
    const html = renderToString(React.createElement(Button, { variant: 'danger' }, 'Delete'))
    expect(html).toContain('bg-[#FF453A]')
  })

  it('renders warning variant', () => {
    const html = renderToString(React.createElement(Button, { variant: 'warning' }, 'Warn'))
    expect(html).toContain('bg-[#FF9F0A]')
  })

  it('renders ghost variant', () => {
    const html = renderToString(React.createElement(Button, { variant: 'ghost' }, 'Ghost'))
    expect(html).toContain('bg-transparent')
  })

  it('renders normal variant', () => {
    const html = renderToString(React.createElement(Button, { variant: 'normal' }, 'Normal'))
    expect(html).toContain('bg-[#32D74B]')
  })

  it('renders default size (md)', () => {
    const html = renderToString(React.createElement(Button, null, 'test'))
    expect(html).toContain('px-3 py-1.5 text-sm')
  })

  it('renders sm size', () => {
    const html = renderToString(React.createElement(Button, { size: 'sm' }, 'Small'))
    expect(html).toContain('px-2 py-1 text-xs')
  })

  it('renders lg size', () => {
    const html = renderToString(React.createElement(Button, { size: 'lg' }, 'Large'))
    expect(html).toContain('px-4 py-2 text-sm')
  })

  it('renders disabled state', () => {
    const html = renderToString(React.createElement(Button, { disabled: true }, 'Disabled'))
    expect(html).toContain('disabled')
    expect(html).toContain('opacity-50')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Button, { className: 'w-full' }, 'test'))
    expect(html).toContain('w-full')
  })

  it('renders as button element', () => {
    const html = renderToString(React.createElement(Button, null, 'test'))
    expect(html).toContain('<button')
    expect(html).toContain('</button>')
  })
})

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Slider } from '../slider'

describe('Slider', () => {
  it('renders range input with correct min/max/step', () => {
    const html = renderToString(React.createElement(Slider, { name: 'temp', min: 16, max: 30, step: 1, value: 22 }))
    expect(html).toContain('type="range"')
    expect(html).toContain('min="16"')
    expect(html).toContain('max="30"')
    expect(html).toContain('step="1"')
    expect(html).toContain('value="22"')
  })

  it('renders labels by default', () => {
    const html = renderToString(React.createElement(Slider, { name: 'temp', min: 16, max: 30, step: 1, value: 22 }))
    expect(html).toContain('16')
    expect(html).toContain('30')
    expect(html).toContain('22')
  })

  it('hides labels when showLabels=false', () => {
    const html = renderToString(React.createElement(Slider, { name: 't', min: 0, max: 100, step: 1, value: 50, showLabels: false }))
    expect(html).not.toContain('justify-between')
  })

  it('appends unit to labels', () => {
    const html = renderToString(React.createElement(Slider, { name: 't', min: 0, max: 100, step: 1, value: 50, unit: '°C' }))
    expect(html).toContain('0')
    expect(html).toContain('°C')
    expect(html).toContain('100')
  })

  it('renders disabled state', () => {
    const html = renderToString(React.createElement(Slider, { name: 't', min: 0, max: 10, step: 1, value: 5, disabled: true }))
    expect(html).toContain('disabled')
  })

  it('wraps in form when formAction provided', () => {
    const formAction = vi.fn()
    const html = renderToString(React.createElement(Slider, { name: 't', min: 0, max: 10, step: 1, value: 5, formAction }))
    expect(html).toContain('<form')
    expect(html).toContain('</form>')
  })

  it('wraps in div when no formAction', () => {
    const html = renderToString(React.createElement(Slider, { name: 't', min: 0, max: 10, step: 1, value: 5 }))
    expect(html).toContain('<div')
    expect(html).not.toContain('<form')
  })
})

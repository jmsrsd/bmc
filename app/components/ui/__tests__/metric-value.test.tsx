import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MetricValue } from '../metric-value'

describe('MetricValue', () => {
  it('renders value and label', () => {
    const html = renderToString(React.createElement(MetricValue, { value: '42', label: 'Zones' }))
    expect(html).toContain('42')
    expect(html).toContain('Zones')
  })

  it('renders numeric value', () => {
    const html = renderToString(React.createElement(MetricValue, { value: 100, label: 'Sensors' }))
    expect(html).toContain('100')
    expect(html).toContain('Sensors')
  })

  it('has glassmorphism card wrapper', () => {
    const html = renderToString(React.createElement(MetricValue, { value: 1, label: 'x' }))
    expect(html).toContain('rounded-xl')
    expect(html).toContain('bg-surface/50')
    expect(html).toContain('border border-hairline')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(MetricValue, { value: '50', label: 'Test', className: 'col-span-2' }))
    expect(html).toContain('col-span-2')
  })
})

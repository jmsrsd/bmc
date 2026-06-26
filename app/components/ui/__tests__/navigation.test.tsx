import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...rest }: any) =>
    React.createElement('a', { ...rest, href, className }, children),
}))

vi.mock('lucide-react', () => ({
  Building2: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-building' }),
  Thermometer: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-thermo' }),
  Lightbulb: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-bulb' }),
  Shield: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-shield' }),
  Bell: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-bell' }),
  Flame: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-flame' }),
  ArrowUpDown: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-elevator' }),
  Zap: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-zap' }),
}))

import { Navigation } from '../navigation'

describe('Navigation', () => {
  it('renders all nav links', () => {
    const html = renderToString(React.createElement(Navigation))
    expect(html).toContain('Building')
    expect(html).toContain('HVAC')
    expect(html).toContain('Lighting')
    expect(html).toContain('Security')
    expect(html).toContain('Alarms')
    expect(html).toContain('Fire')
    expect(html).toContain('Elevators')
    expect(html).toContain('Energy')
  })

  it('renders BMC branding', () => {
    const html = renderToString(React.createElement(Navigation))
    expect(html).toContain('BMC')
    expect(html).toContain('Biomedical Campus')
  })

  it('renders as nav element', () => {
    const html = renderToString(React.createElement(Navigation))
    expect(html).toContain('<nav')
  })

  it('renders all 8 link elements', () => {
    const html = renderToString(React.createElement(Navigation))
    const links = html.match(/<a\s/g) || []
    expect(links).toHaveLength(8)
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Navigation, { className: 'mt-4' }))
    expect(html).toContain('mt-4')
  })
})

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

// Mock lucide-react for TrendingUp/TrendingDown
vi.mock('lucide-react', () => ({
  TrendingUp: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'trending-up' }),
  TrendingDown: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'trending-down' }),
}))

import { StatCard } from '../stat-card'

describe('StatCard', () => {
  it('renders label and value', () => {
    const html = renderToString(React.createElement(StatCard, { label: 'Zones', value: 42 }))
    expect(html).toContain('Zones')
    expect(html).toContain('42')
  })

  it('renders positive trend', () => {
    const html = renderToString(React.createElement(StatCard, { label: 'Energy', value: 85, trend: 12 }))
    expect(html).toContain('data-testid="trending-up"')
    expect(html).toContain('text-[#32D74B]')
  })

  it('renders negative trend', () => {
    const html = renderToString(React.createElement(StatCard, { label: 'Energy', value: 50, trend: -8 }))
    expect(html).toContain('data-testid="trending-down"')
    expect(html).toContain('text-[#FF453A]')
  })

  it('renders zero trend as no trend indicator', () => {
    const html = renderToString(React.createElement(StatCard, { label: 'Energy', value: 100, trend: 0 }))
    // Zero trend renders neither up nor down — ternary null branch
    // But % still appears because trend=0 renders "0%" via {trend}%
    // So just check no trending icon
    expect(html).not.toContain('trending-up')
    expect(html).not.toContain('trending-down')
  })

  it('renders no trend block when trend undefined', () => {
    const html = renderToString(React.createElement(StatCard, { label: 'Test', value: 1 }))
    expect(html).not.toContain('trending')
  })

  it('renders Card wrapper with glassmorphism', () => {
    const html = renderToString(React.createElement(StatCard, { label: 'Test', value: 1 }))
    expect(html).toContain('rounded-xl')
    expect(html).toContain('backdrop-blur')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(StatCard, { label: 'Test', value: 1, className: 'col-span-2' }))
    expect(html).toContain('col-span-2')
  })
})

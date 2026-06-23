import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LightingCard } from '../LightingCard'
import type { WidgetConfig } from '@/lib/ui-config/types'

// Mock child UI controls
vi.mock('@/components/ui/lighting-controls', () => ({
  DimSlider: vi.fn(() => <div data-testid="dim-slider">DimSlider</div>),
  LightToggle: vi.fn(() => <div data-testid="light-toggle">LightToggle</div>),
}))

const baseConfig: WidgetConfig = {
  id: 'light-1',
  type: 'lighting-control',
  title: 'Living Room Lights',
  zoneId: 'zone-living',
  capabilities: [],
}

describe('LightingCard', () => {
  it('renders header with title', () => {
    render(<LightingCard config={baseConfig} />)
    expect(screen.getByText('Living Room Lights')).toBeInTheDocument()
  })

  it('renders deviceType badge when provided', () => {
    render(<LightingCard config={{ ...baseConfig, deviceType: 'Dimmable LED' }} />)
    expect(screen.getByText('Dimmable LED')).toBeInTheDocument()
  })

  it('renders LightToggle when capability on-off and zoneId present', () => {
    render(<LightingCard config={{ ...baseConfig, capabilities: ['on-off'] }} />)
    expect(screen.getByTestId('light-toggle')).toBeInTheDocument()
  })

  it('does not render LightToggle when on-off capability missing', () => {
    render(<LightingCard config={baseConfig} />)
    expect(screen.queryByTestId('light-toggle')).not.toBeInTheDocument()
  })

  it('renders DimSlider when capability dim-level and zoneId present', () => {
    render(<LightingCard config={{ ...baseConfig, capabilities: ['dim-level'] }} />)
    expect(screen.getByTestId('dim-slider')).toBeInTheDocument()
  })

  it('does not render DimSlider when dim-level capability missing', () => {
    render(<LightingCard config={baseConfig} />)
    expect(screen.queryByTestId('dim-slider')).not.toBeInTheDocument()
  })

  it('renders both controls when both capabilities present', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      capabilities: ['on-off', 'dim-level'],
    }
    render(<LightingCard config={config} />)
    expect(screen.getByTestId('light-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('dim-slider')).toBeInTheDocument()
  })

  it('does not render controls when zoneId is missing even with capabilities', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      zoneId: undefined,
      capabilities: ['on-off', 'dim-level'],
    }
    render(<LightingCard config={config} />)
    expect(screen.queryByTestId('light-toggle')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dim-slider')).not.toBeInTheDocument()
  })
})

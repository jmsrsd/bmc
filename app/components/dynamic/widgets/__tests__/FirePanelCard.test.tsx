import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FirePanelCard } from '../FirePanelCard'
import type { WidgetConfig } from '@/lib/ui-config/types'

const baseConfig: WidgetConfig = {
  id: 'fire-1',
  type: 'fire-panel',
  title: 'Floor 1 Fire Panel',
  deviceId: 'panel-1',
  capabilities: [],
}

describe('FirePanelCard', () => {
  it('renders header with title', () => {
    render(<FirePanelCard config={baseConfig} />)
    expect(screen.getByText('Floor 1 Fire Panel')).toBeInTheDocument()
  })

  it('renders Normal status', () => {
    render(<FirePanelCard config={baseConfig} />)
    expect(screen.getByText('Normal')).toBeInTheDocument()
  })

  it('renders green status dot', () => {
    render(<FirePanelCard config={baseConfig} />)
    const dot = document.querySelector('.bg-green-500')
    expect(dot).toBeInTheDocument()
  })

  it('renders deviceId in status section', () => {
    render(<FirePanelCard config={baseConfig} />)
    expect(screen.getByText('panel-1')).toBeInTheDocument()
  })

  it('falls back to config.id when deviceId is missing', () => {
    const config: WidgetConfig = { ...baseConfig, deviceId: undefined }
    render(<FirePanelCard config={config} />)
    expect(screen.getByText('fire-1')).toBeInTheDocument()
  })

  it('renders deviceType badge when provided', () => {
    render(<FirePanelCard config={{ ...baseConfig, deviceType: 'Notifier AFP-200' }} />)
    expect(screen.getByText('Notifier AFP-200')).toBeInTheDocument()
  })

  it('renders zone readouts when sensors provided', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      sensors: [
        { type: 'smoke', label: 'Smoke Detector 1', unit: 'ppm' },
        { type: 'heat', label: 'Heat Sensor 1', unit: '°C' },
      ],
    }
    render(<FirePanelCard config={config} />)
    expect(screen.getByText('smoke')).toBeInTheDocument()
    expect(screen.getByText('heat')).toBeInTheDocument()
    // Each zone shows '--'
    const dashes = screen.getAllByText('--')
    expect(dashes).toHaveLength(2)
  })

  it('does not render zone readouts when no sensors', () => {
    render(<FirePanelCard config={baseConfig} />)
    expect(screen.queryByText('smoke')).not.toBeInTheDocument()
    expect(screen.queryByText('heat')).not.toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MeterGauge } from '../MeterGauge'
import type { WidgetConfig } from '@/lib/ui-config/types'

const baseConfig: WidgetConfig = {
  id: 'meter-1',
  type: 'meter-gauge',
  title: 'Power Meter',
  deviceId: 'meter-main',
  capabilities: [],
}

describe('MeterGauge', () => {
  it('renders header with title', () => {
    render(<MeterGauge config={baseConfig} />)
    expect(screen.getByText('Power Meter')).toBeInTheDocument()
  })

  it('renders meter display with dash placeholder', () => {
    render(<MeterGauge config={baseConfig} />)
    const dashes = screen.getAllByText('--')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('renders deviceId in the meter display', () => {
    render(<MeterGauge config={baseConfig} />)
    expect(screen.getByText('meter-main')).toBeInTheDocument()
  })

  it('falls back to config.id when deviceId is missing', () => {
    const config: WidgetConfig = { ...baseConfig, deviceId: undefined }
    render(<MeterGauge config={config} />)
    expect(screen.getByText('meter-1')).toBeInTheDocument()
  })

  it('renders deviceType badge when provided', () => {
    render(<MeterGauge config={{ ...baseConfig, deviceType: 'Main Breaker' }} />)
    expect(screen.getByText('Main Breaker')).toBeInTheDocument()
  })

  it('renders sensor sub-readings when sensors provided', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      sensors: [
        { type: 'voltage', label: 'Voltage', unit: 'V' },
        { type: 'current', label: 'Current', unit: 'A' },
      ],
    }
    render(<MeterGauge config={config} />)
    expect(screen.getByText('voltage')).toBeInTheDocument()
    expect(screen.getByText('current')).toBeInTheDocument()
    // Each sub-reading shows '--'
    const dashes = screen.getAllByText('--')
    expect(dashes).toHaveLength(3) // 1 main meter + 2 sub-readings
  })

  it('does not render sensor section when no sensors', () => {
    render(<MeterGauge config={baseConfig} />)
    expect(screen.getByText('meter-main')).toBeInTheDocument()
    // Only the main meter '--', no sub-reading labels
    expect(screen.queryByText('voltage')).not.toBeInTheDocument()
  })
})

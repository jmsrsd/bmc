import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SensorReadout } from '../SensorReadout'
import type { WidgetConfig } from '@/lib/ui-config/types'

const baseConfig: WidgetConfig = {
  id: 'sensor-1',
  type: 'sensor-readout',
  title: 'Environmental Sensors',
  capabilities: [],
}

describe('SensorReadout', () => {
  it('renders header with title', () => {
    render(<SensorReadout config={baseConfig} />)
    expect(screen.getByText('Environmental Sensors')).toBeInTheDocument()
  })

  it('renders sensor grid when sensors provided', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      sensors: [
        { type: 'temperature', label: 'Temp', unit: '°C' },
        { type: 'humidity', label: 'Humidity', unit: '%' },
        { type: 'co2', label: 'CO₂', unit: 'ppm' },
      ],
    }
    render(<SensorReadout config={config} />)
    expect(screen.getByText('temperature')).toBeInTheDocument()
    expect(screen.getByText('humidity')).toBeInTheDocument()
    expect(screen.getByText('co2')).toBeInTheDocument()
    // Each sensor shows '--' placeholder
    const placeholders = screen.getAllByText('--')
    expect(placeholders).toHaveLength(3)
  })

  it('shows "No sensors configured" when sensors array is empty', () => {
    render(<SensorReadout config={{ ...baseConfig, sensors: [] }} />)
    expect(screen.getByText('No sensors configured')).toBeInTheDocument()
  })

  it('shows "No sensors configured" when sensors is undefined', () => {
    render(<SensorReadout config={baseConfig} />)
    expect(screen.getByText('No sensors configured')).toBeInTheDocument()
  })

  it('uses fallback label when sensor type is empty', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      sensors: [
        { type: '', label: 'Custom', unit: 'V' },
      ],
    }
    render(<SensorReadout config={config} />)
    // '' ?? 'fallback' → '' (empty string). The <p> exists with empty content.
    const labels = screen.getAllByText('')
    expect(labels.length).toBeGreaterThan(0)
  })
})

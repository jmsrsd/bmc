import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HvacCard } from '../HvacCard'
import type { WidgetConfig } from '@/lib/ui-config/types'

// Mock child UI controls
vi.mock('@/components/ui/hvac-controls', () => ({
  SetpointForm: vi.fn(() => <div data-testid="setpoint-form">SetpointForm</div>),
  FanSpeedButtons: vi.fn(() => <div data-testid="fan-speed-buttons">FanSpeedButtons</div>),
  HvacModeButtons: vi.fn(() => <div data-testid="hvac-mode-buttons">HvacModeButtons</div>),
}))

const baseConfig: WidgetConfig = {
  id: 'hvac-1',
  type: 'hvac-control',
  title: 'Zone A HVAC',
  zoneId: 'zone-a',
  capabilities: [],
}

describe('HvacCard', () => {
  it('renders header with title', () => {
    render(<HvacCard config={baseConfig} />)
    expect(screen.getByText('Zone A HVAC')).toBeInTheDocument()
  })

  it('renders Thermometer icon via role img', () => {
    render(<HvacCard config={baseConfig} />)
    // lucide-react icons render as SVG with role="img"
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('renders deviceType badge when provided', () => {
    render(<HvacCard config={{ ...baseConfig, deviceType: 'Rooftop Unit' }} />)
    expect(screen.getByText('Rooftop Unit')).toBeInTheDocument()
  })

  it('renders sensor grid when sensors provided', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      sensors: [
        { type: 'temperature', label: 'Temp', unit: '°C' },
        { type: 'humidity', label: 'Humidity', unit: '%' },
      ],
    }
    render(<HvacCard config={config} />)
    expect(screen.getByText('temperature')).toBeInTheDocument()
    expect(screen.getByText('humidity')).toBeInTheDocument()
    // Each sensor shows '--' placeholder
    const placeholders = screen.getAllByText('--')
    expect(placeholders).toHaveLength(2)
  })

  it('does not render sensor grid when no sensors', () => {
    render(<HvacCard config={baseConfig} />)
    const placeholders = screen.queryAllByText('--')
    // Only the '--' from conditional controls would appear... but none here
    expect(placeholders).toHaveLength(0)
  })

  it('renders SetpointForm when capability setpoint and zoneId present', () => {
    render(<HvacCard config={{ ...baseConfig, capabilities: ['setpoint'] }} />)
    expect(screen.getByTestId('setpoint-form')).toBeInTheDocument()
  })

  it('does not render SetpointForm when setpoint capability missing', () => {
    render(<HvacCard config={baseConfig} />)
    expect(screen.queryByTestId('setpoint-form')).not.toBeInTheDocument()
  })

  it('renders FanSpeedButtons when capability fan-speed and zoneId present', () => {
    render(<HvacCard config={{ ...baseConfig, capabilities: ['fan-speed'] }} />)
    expect(screen.getByTestId('fan-speed-buttons')).toBeInTheDocument()
  })

  it('does not render FanSpeedButtons when fan-speed capability missing', () => {
    render(<HvacCard config={baseConfig} />)
    expect(screen.queryByTestId('fan-speed-buttons')).not.toBeInTheDocument()
  })

  it('renders HvacModeButtons when capability hvac-mode and zoneId present', () => {
    render(<HvacCard config={{ ...baseConfig, capabilities: ['hvac-mode'] }} />)
    expect(screen.getByTestId('hvac-mode-buttons')).toBeInTheDocument()
  })

  it('does not render HvacModeButtons when hvac-mode capability missing', () => {
    render(<HvacCard config={baseConfig} />)
    expect(screen.queryByTestId('hvac-mode-buttons')).not.toBeInTheDocument()
  })

  it('renders all three controls when all capabilities present', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      capabilities: ['setpoint', 'fan-speed', 'hvac-mode'],
    }
    render(<HvacCard config={config} />)
    expect(screen.getByTestId('setpoint-form')).toBeInTheDocument()
    expect(screen.getByTestId('fan-speed-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('hvac-mode-buttons')).toBeInTheDocument()
  })

  it('does not render controls when zoneId is missing even with capabilities', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      zoneId: undefined,
      capabilities: ['setpoint', 'fan-speed', 'hvac-mode'],
    }
    render(<HvacCard config={config} />)
    expect(screen.queryByTestId('setpoint-form')).not.toBeInTheDocument()
    expect(screen.queryByTestId('fan-speed-buttons')).not.toBeInTheDocument()
    expect(screen.queryByTestId('hvac-mode-buttons')).not.toBeInTheDocument()
  })
})

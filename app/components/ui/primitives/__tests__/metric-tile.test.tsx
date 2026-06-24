import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricTile, SensorTile } from '../metric-tile'

describe('MetricTile', () => {
  it('renders label', () => {
    render(<MetricTile label="CPU" value="45%" />)
    expect(screen.getByText('CPU')).toBeInTheDocument()
  })

  it('renders value', () => {
    render(<MetricTile label="CPU" value="45%" />)
    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('custom valueColor prop applied', () => {
    const { container } = render(
      <MetricTile label="CPU" value="45%" valueColor="text-status-critical" />
    )
    const valueEl = container.querySelector('.text-xl')
    expect(valueEl).toHaveClass('text-status-critical')
  })

  it('renders unit when provided', () => {
    render(<MetricTile label="Temp" value="72" unit="°F" />)
    expect(screen.getByText('°F')).toBeInTheDocument()
  })

  it('no unit renders no unit element', () => {
    const { container } = render(<MetricTile label="Temp" value="72" />)
    const unitEls = container.querySelectorAll('.text-xs.text-muted-foreground')
    // There's the label element and potentially unit. Label is always present as first text-xs
    expect(unitEls.length).toBe(1) // only the label
  })
})

describe('SensorTile', () => {
  it('renders value and label', () => {
    render(<SensorTile value="25" label="Temperature" />)
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
  })

  it('renders icon inside wrapper', () => {
    const { container } = render(
      <SensorTile value="25" label="Temp" icon={<span data-testid="sensor-icon">🌡</span>} />
    )
    expect(screen.getByTestId('sensor-icon')).toBeInTheDocument()
    const iconDiv = container.querySelector('.mx-auto')
    expect(iconDiv).toBeInTheDocument()
  })

  it('iconColor prop applied to icon wrapper', () => {
    const { container } = render(
      <SensorTile value="25" label="Temp" icon={<span>🌡</span>} iconColor="text-red-500" />
    )
    const iconWrapper = container.querySelector('.mx-auto')
    expect(iconWrapper).toHaveClass('text-red-500')
  })

  it('no icon renders no icon div', () => {
    const { container } = render(<SensorTile value="25" label="Temp" />)
    const iconDiv = container.querySelector('.mx-auto')
    expect(iconDiv).toBeNull()
  })
})

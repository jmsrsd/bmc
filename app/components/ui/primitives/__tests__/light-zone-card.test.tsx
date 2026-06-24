import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LightZoneCard } from '../light-zone-card'

const baseZone = {
  id: 'lz1',
  zoneId: 'zone1',
  name: 'Main Lights',
  zone: { name: 'Room A', floor: 2 },
  state: 'ON' as const,
  dimLevel: 70,
  power: 120,
}

describe('LightZoneCard', () => {
  it('renders zone name and location', () => {
    render(
      <LightZoneCard
        zone={baseZone}
        dimSlider={<div>slider</div>}
        lightToggle={<div>toggle</div>}
      />
    )
    expect(screen.getByText('Main Lights')).toBeInTheDocument()
    expect(screen.getByText('Room A · Floor 2')).toBeInTheDocument()
  })

  it('falls back to zone.name when zone.name is empty', () => {
    render(
      <LightZoneCard
        zone={{ ...baseZone, name: '' }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    // zone.name is empty, falls back to zone.zone.name = "Room A"
    expect(screen.getByText('Room A')).toBeInTheDocument()
  })

  it('ON state shows active badge with normal StatusLed', () => {
    const { container } = render(
      <LightZoneCard
        zone={baseZone}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    const badge = screen.getByText('ON').closest('span')
    expect(badge).toHaveClass('bg-status-active/20')
    expect(badge).toHaveClass('text-status-active')
    // StatusLed inside badge has normal (green) — bg-status-normal
    const led = container.querySelector('span > span')
    expect(led).toHaveClass('bg-status-normal')
  })

  it('OFF state shows muted badge with unknown StatusLed', () => {
    const { container } = render(
      <LightZoneCard
        zone={{ ...baseZone, state: 'OFF' }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    const badge = screen.getByText('OFF').closest('span')
    expect(badge).toHaveClass('bg-bg-elevated/20')
    expect(badge).toHaveClass('text-muted-foreground')
    // StatusLed — unknown maps to bg-gray-500 (not bg-status-unknown)
    const led = container.querySelector('span > span')
    expect(led).toHaveClass('bg-gray-500')
  })

  it('dim bar uses correct color class from dimBarColor(70) → bg-status-warning', () => {
    render(
      <LightZoneCard
        zone={baseZone}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    const bar = document.querySelector('.h-full.rounded-full')
    // 70 ≥ 40 → bg-status-warning
    expect(bar).toHaveClass('bg-status-warning')
  })

  it('dim bar width reflects dimLevel percentage', () => {
    render(
      <LightZoneCard
        zone={{ ...baseZone, dimLevel: 45 }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    const bar = document.querySelector('.h-full.rounded-full') as HTMLElement
    expect(bar.style.width).toBe('45%')
  })

  it('dim bar shows bg-status-active for level ≥ 75', () => {
    render(
      <LightZoneCard
        zone={{ ...baseZone, dimLevel: 80 }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    const bar = document.querySelector('.h-full.rounded-full')
    expect(bar).toHaveClass('bg-status-active')
  })

  it('dim bar shows bg-amber-600 for level < 40', () => {
    render(
      <LightZoneCard
        zone={{ ...baseZone, dimLevel: 20 }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    const bar = document.querySelector('.h-full.rounded-full')
    expect(bar).toHaveClass('bg-amber-600')
  })

  it('shows dim level percentage text', () => {
    render(
      <LightZoneCard
        zone={{ ...baseZone, dimLevel: 55 }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    expect(screen.getByText('55%')).toBeInTheDocument()
  })

  it('renders dimSlider slot', () => {
    render(
      <LightZoneCard
        zone={baseZone}
        dimSlider={<div data-testid="dim-slider">slider</div>}
        lightToggle={<div />}
      />
    )
    expect(screen.getByTestId('dim-slider')).toBeInTheDocument()
    expect(screen.getByText('slider')).toBeInTheDocument()
  })

  it('renders lightToggle slot', () => {
    render(
      <LightZoneCard
        zone={baseZone}
        dimSlider={<div />}
        lightToggle={<div data-testid="light-toggle">toggle</div>}
      />
    )
    expect(screen.getByTestId('light-toggle')).toBeInTheDocument()
    expect(screen.getByText('toggle')).toBeInTheDocument()
  })

  it('shows power consumption when power > 0', () => {
    render(
      <LightZoneCard
        zone={{ ...baseZone, power: 250.5 }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    expect(screen.getByText('Power: 250.5 W')).toBeInTheDocument()
  })

  it('hides power line when power is 0', () => {
    render(
      <LightZoneCard
        zone={{ ...baseZone, power: 0 }}
        dimSlider={<div />}
        lightToggle={<div />}
      />
    )
    expect(screen.queryByText(/Power/)).not.toBeInTheDocument()
  })
})

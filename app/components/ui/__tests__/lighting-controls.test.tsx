import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DimSlider, LightToggle } from '../lighting-controls'

vi.mock('@/lib/actions', () => ({
  setDimLevel: vi.fn(async () => ({})),
  toggleLight: vi.fn(async () => ({})),
}))

describe('DimSlider', () => {
  it('renders with current level', () => {
    render(<DimSlider zoneId="z1" currentLevel={65} />)
    expect(screen.getByText('65%')).toBeInTheDocument()
  })

  it('renders range input with correct min/max', () => {
    render(<DimSlider zoneId="z1" currentLevel={50} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '100')
  })

  it('has correct default value', () => {
    render(<DimSlider zoneId="z1" currentLevel={42} />)
    const slider = screen.getByRole('slider') as HTMLInputElement
    expect(slider.value).toBe('42')
  })

  it('renders hidden zoneId', () => {
    render(<DimSlider zoneId="zone-dim" currentLevel={50} />)
    const hidden = document.querySelector('input[name="zoneId"]') as HTMLInputElement
    expect(hidden?.value).toBe('zone-dim')
  })
})

describe('LightToggle', () => {
  it('shows Turn Off when lights are ON', () => {
    render(<LightToggle zoneId="z1" currentState="ON" />)
    expect(screen.getByText('Turn Off')).toBeInTheDocument()
  })

  it('shows Turn On when lights are OFF', () => {
    render(<LightToggle zoneId="z1" currentState="OFF" />)
    expect(screen.getByText('Turn On')).toBeInTheDocument()
  })

  it('has hidden inputs for zoneId and newState', () => {
    render(<LightToggle zoneId="zone-lt" currentState="OFF" />)
    const zoneInput = document.querySelector('input[name="zoneId"]') as HTMLInputElement
    expect(zoneInput?.value).toBe('zone-lt')
    const stateInput = document.querySelector('input[name="newState"]') as HTMLInputElement
    expect(stateInput?.value).toBe('ON')
  })
})

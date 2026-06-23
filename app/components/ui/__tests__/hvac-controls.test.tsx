import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetpointForm, FanSpeedButtons, HvacModeButtons } from '../hvac-controls'

// Mock the Server Actions that useActionState calls internally
vi.mock('@/lib/actions', () => ({
  setTemperature: vi.fn(async () => ({})),
  setFanSpeed: vi.fn(async () => ({})),
  setHvacMode: vi.fn(async () => ({})),
}))

describe('SetpointForm', () => {
  it('renders with given setpoint value', () => {
    render(<SetpointForm zoneId="z1" currentSetpoint={23} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(23)
  })

  it('renders hidden zoneId input', () => {
    render(<SetpointForm zoneId="zone-abc" currentSetpoint={22} />)
    const hiddenInput = document.querySelector('input[name="zoneId"]') as HTMLInputElement
    expect(hiddenInput).not.toBeNull()
    expect(hiddenInput.value).toBe('zone-abc')
  })

  it('defaults to 22 when no setpoint given', () => {
    render(<SetpointForm zoneId="z1" currentSetpoint={null} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(22)
  })

  it('renders submit button', () => {
    render(<SetpointForm zoneId="z1" currentSetpoint={22} />)
    expect(screen.getByRole('button', { name: /set/i })).toBeInTheDocument()
  })

  it('has correct min/max/step attributes', () => {
    render(<SetpointForm zoneId="z1" currentSetpoint={22} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('min', '16')
    expect(input).toHaveAttribute('max', '30')
    expect(input).toHaveAttribute('step', '0.5')
  })
})

describe('FanSpeedButtons', () => {
  it('renders all 5 speed options', () => {
    render(<FanSpeedButtons zoneId="z1" currentSpeed="AUTO" />)
    expect(screen.getByText('Off')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
  })

  it('highlights current speed', () => {
    render(<FanSpeedButtons zoneId="z1" currentSpeed="HIGH" />)
    const highBtn = screen.getByText('High')
    expect(highBtn.className).toContain('bg-cyan-600')
  })

  it('does not highlight other speeds', () => {
    render(<FanSpeedButtons zoneId="z1" currentSpeed="HIGH" />)
    const offBtn = screen.getByText('Off')
    expect(offBtn.className).not.toContain('bg-cyan-600')
  })

  it('renders hidden zoneId', () => {
    render(<FanSpeedButtons zoneId="zone-42" currentSpeed="AUTO" />)
    const hidden = document.querySelector('input[name="zoneId"]') as HTMLInputElement
    expect(hidden?.value).toBe('zone-42')
  })
})

describe('HvacModeButtons', () => {
  it('renders all 4 mode options', () => {
    render(<HvacModeButtons zoneId="z1" currentMode="COOL" />)
    expect(screen.getByText('Cool')).toBeInTheDocument()
    expect(screen.getByText('Heat')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
    expect(screen.getByText('Vent')).toBeInTheDocument()
  })

  it('highlights current mode', () => {
    render(<HvacModeButtons zoneId="z1" currentMode="HEAT" />)
    expect(screen.getByText('Heat').className).toContain('bg-blue-600')
  })

  it('renders hidden zoneId', () => {
    render(<HvacModeButtons zoneId="zone-99" currentMode="AUTO" />)
    const hidden = document.querySelector('input[name="zoneId"]') as HTMLInputElement
    expect(hidden?.value).toBe('zone-99')
  })
})

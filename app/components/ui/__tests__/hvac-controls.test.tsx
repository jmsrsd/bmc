import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  setTemperature: vi.fn(),
  setFanSpeed: vi.fn(),
  setHvacMode: vi.fn(),
}))

import { SetpointForm, FanSpeedButtons, HvacModeButtons } from '../hvac-controls'

const setupUser = () => userEvent.setup()

describe('SetpointForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders hidden zoneId input', () => {
    render(<SetpointForm zoneId="z1" currentSetpoint={22} />)
    const input = document.querySelector('input[name="zoneId"]') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input?.value).toBe('z1')
    expect(input?.type).toBe('hidden')
  })

  it('renders number input with min=16 max=30 step=0.5', () => {
    render(<SetpointForm zoneId="z1" currentSetpoint={22} />)
    const numInput = screen.getByRole('spinbutton') as HTMLInputElement
    expect(numInput).not.toBeNull()
    expect(numInput.min).toBe('16')
    expect(numInput.max).toBe('30')
    expect(numInput.step).toBe('0.5')
  })

  it('defaultValue from currentSetpoint prop', () => {
    render(<SetpointForm zoneId="z1" currentSetpoint={24} />)
    const numInput = screen.getByRole('spinbutton') as HTMLInputElement
    expect(numInput.defaultValue).toBe('24')
  })

  it('pending → button shows ...', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { setTemperature } = await import('@/lib/actions')
    vi.mocked(setTemperature).mockResolvedValue(deferred)

    render(<SetpointForm zoneId="z1" currentSetpoint={22} />)
    const user = setupUser()
    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button').textContent).toBe('...')

    deferredResolve!({ success: true, setpoint: 24, zoneId: 'z1' })
  })

  it('success → shows Updated text', async () => {
    const { setTemperature } = await import('@/lib/actions')
    vi.mocked(setTemperature).mockResolvedValue({ success: true, setpoint: 24, zoneId: 'z1' })

    render(<SetpointForm zoneId="z1" currentSetpoint={22} />)
    const user = setupUser()
    await user.click(screen.getByRole('button'))

    const updated = await screen.findByText('Updated')
    expect(updated).toBeDefined()
    expect(updated.className).toContain('text-status-normal')
  })

  it('error → shows error text in status-critical', async () => {
    const { setTemperature } = await import('@/lib/actions')
    vi.mocked(setTemperature).mockResolvedValue({ error: 'Temp error' })

    render(<SetpointForm zoneId="z1" currentSetpoint={22} />)
    const user = setupUser()
    await user.click(screen.getByRole('button'))

    const errText = await screen.findByText('Temp error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

describe('FanSpeedButtons', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders all 5 speed buttons (OFF, LOW, MEDIUM, HIGH, AUTO)', () => {
    render(<FanSpeedButtons zoneId="z1" currentSpeed="OFF" />)
    expect(screen.getByRole('button', { name: /Off/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Low/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Medium/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /High/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Auto/i })).toBeDefined()
  })

  it('currentSpeed=MEDIUM gives active styling', () => {
    render(<FanSpeedButtons zoneId="z1" currentSpeed="MEDIUM" />)
    const mediumBtn = screen.getByRole('button', { name: /Medium/i })
    expect(mediumBtn.className).toContain('bg-status-active')
  })

  it('non-active speed button does not have active styling', () => {
    render(<FanSpeedButtons zoneId="z1" currentSpeed="MEDIUM" />)
    const offBtn = screen.getByRole('button', { name: /Off/i })
    expect(offBtn.className).not.toContain('bg-status-active')
  })

  it('pending → all buttons disabled', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { setFanSpeed } = await import('@/lib/actions')
    vi.mocked(setFanSpeed).mockResolvedValue(deferred)

    render(<FanSpeedButtons zoneId="z1" currentSpeed="MEDIUM" />)
    const user = setupUser()
    await user.click(screen.getByRole('button', { name: /High/i }))

    screen.getAllByRole('button').forEach(btn => {
      expect(btn.getAttribute('disabled')).toBe('')
    })

    deferredResolve!({ success: true, speed: 'AUTO', zoneId: 'z1' })
  })

  it('error → displays error text', async () => {
    const { setFanSpeed } = await import('@/lib/actions')
    vi.mocked(setFanSpeed).mockResolvedValue({ error: 'Fan error' })

    render(<FanSpeedButtons zoneId="z1" currentSpeed="MEDIUM" />)
    const user = setupUser()
    await user.click(screen.getByRole('button', { name: /High/i }))

    const errText = await screen.findByText('Fan error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

describe('HvacModeButtons', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders all 4 mode buttons (COOL, HEAT, AUTO, VENT)', () => {
    render(<HvacModeButtons zoneId="z1" currentMode="COOL" />)
    expect(screen.getByRole('button', { name: /Cool/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Heat/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Auto/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Vent/i })).toBeDefined()
  })

  it('currentMode=COOL gives active styling', () => {
    render(<HvacModeButtons zoneId="z1" currentMode="COOL" />)
    const coolBtn = screen.getByRole('button', { name: /Cool/i })
    expect(coolBtn.className).toContain('bg-status-active')
  })

  it('non-active mode does not have active styling', () => {
    render(<HvacModeButtons zoneId="z1" currentMode="COOL" />)
    const heatBtn = screen.getByRole('button', { name: /Heat/i })
    expect(heatBtn.className).not.toContain('bg-status-active')
  })

  it('pending → all buttons disabled', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { setHvacMode } = await import('@/lib/actions')
    vi.mocked(setHvacMode).mockResolvedValue(deferred)

    render(<HvacModeButtons zoneId="z1" currentMode="COOL" />)
    const user = setupUser()
    await user.click(screen.getByRole('button', { name: /Heat/i }))

    screen.getAllByRole('button').forEach(btn => {
      expect(btn.getAttribute('disabled')).toBe('')
    })

    deferredResolve!({ success: true, mode: 'HEAT', zoneId: 'z1' })
  })

  it('error → displays error text', async () => {
    const { setHvacMode } = await import('@/lib/actions')
    vi.mocked(setHvacMode).mockResolvedValue({ error: 'HVAC error' })

    render(<HvacModeButtons zoneId="z1" currentMode="COOL" />)
    const user = setupUser()
    await user.click(screen.getByRole('button', { name: /Heat/i }))

    const errText = await screen.findByText('HVAC error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

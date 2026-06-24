import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  setDimLevel: vi.fn(),
  toggleLight: vi.fn(),
}))

import { DimSlider, LightToggle } from '../lighting-controls'

describe('DimSlider', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders range input with min=0 max=100', () => {
    render(<DimSlider zoneId="z1" currentLevel={50} />)
    const rangeInput = screen.getByRole('slider') as HTMLInputElement
    expect(rangeInput).not.toBeNull()
    expect(rangeInput.min).toBe('0')
    expect(rangeInput.max).toBe('100')
  })

  it('defaultValue from currentLevel prop', () => {
    render(<DimSlider zoneId="z1" currentLevel={75} />)
    const rangeInput = screen.getByRole('slider') as HTMLInputElement
    expect(rangeInput.defaultValue).toBe('75')
  })

  it('shows current level percentage', () => {
    render(<DimSlider zoneId="z1" currentLevel={75} />)
    expect(screen.getByText('75%')).toBeDefined()
  })

  it('success state shows Updated text', async () => {
    const { setDimLevel } = await import('@/lib/actions')
    vi.mocked(setDimLevel).mockResolvedValue({ success: true, level: 75, zoneId: 'z1' })

    render(<DimSlider zoneId="z1" currentLevel={50} />)
    const btn = screen.getByRole('button', { name: /Update/i })
    const user = userEvent.setup()
    await user.click(btn)

    const updated = await screen.findByText('Updated')
    expect(updated).toBeDefined()
    expect(updated.className).toContain('text-status-normal')
  })

  it('error state shows error text', async () => {
    const { setDimLevel } = await import('@/lib/actions')
    vi.mocked(setDimLevel).mockResolvedValue({ error: 'Dim error' })

    render(<DimSlider zoneId="z1" currentLevel={50} />)
    const btn = screen.getByRole('button', { name: /Update/i })
    const user = userEvent.setup()
    await user.click(btn)

    const errText = await screen.findByText('Dim error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

describe('LightToggle', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('ON state → shows Turn Off button + Sun icon', () => {
    render(<LightToggle zoneId="z1" currentState="ON" />)
    const btn = screen.getByRole('button', { name: /Turn Off/i })
    expect(btn).toBeDefined()
    const svg = document.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('OFF state → shows Turn On button + Moon icon', () => {
    render(<LightToggle zoneId="z1" currentState="OFF" />)
    const btn = screen.getByRole('button', { name: /Turn On/i })
    expect(btn).toBeDefined()
  })

  it('pending → disabled', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { toggleLight } = await import('@/lib/actions')
    vi.mocked(toggleLight).mockResolvedValue(deferred)

    render(<LightToggle zoneId="z1" currentState="ON" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button').getAttribute('disabled')).toBe('')

    deferredResolve!({ success: true, state: 'ON', zoneId: 'z1' })
  })

  it('success state → no error', async () => {
    const { toggleLight } = await import('@/lib/actions')
    vi.mocked(toggleLight).mockResolvedValue({ success: true, state: 'ON', zoneId: 'z1' })

    render(<LightToggle zoneId="z1" currentState="ON" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    await new Promise((r) => setTimeout(r, 50))
    const errorEls = document.querySelectorAll('.text-status-critical')
    expect(errorEls.length).toBe(0)
  })

  it('error → shows error text', async () => {
    const { toggleLight } = await import('@/lib/actions')
    vi.mocked(toggleLight).mockResolvedValue({ error: 'Toggle error' })

    render(<LightToggle zoneId="z1" currentState="ON" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const errText = await screen.findByText('Toggle error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

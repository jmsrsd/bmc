import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  recallElevator: vi.fn(),
}))

import { ElevatorRecallForm } from '../elevator-recall-form'

describe('ElevatorRecallForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders number input with min=-2 max=50', () => {
    render(<ElevatorRecallForm carId="c1" currentFloor={3} />)
    const numInput = screen.getByRole('spinbutton') as HTMLInputElement
    expect(numInput).not.toBeNull()
    expect(numInput.min).toBe('-2')
    expect(numInput.max).toBe('50')
  })

  it('defaultValue from currentFloor prop', () => {
    render(<ElevatorRecallForm carId="c1" currentFloor={5} />)
    const numInput = screen.getByRole('spinbutton') as HTMLInputElement
    expect(numInput.defaultValue).toBe('5')
  })

  it('pending → button disabled + ...', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { recallElevator } = await import('@/lib/actions')
    vi.mocked(recallElevator).mockResolvedValue(deferred)

    render(<ElevatorRecallForm carId="c1" currentFloor={3} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const btn = screen.getByRole('button')
    expect(btn.getAttribute('disabled')).toBe('')
    expect(btn.textContent).toContain('...')

    deferredResolve!({ success: true, carId: 'c1', targetFloor: 3 })
  })

  it('success → shows checkmark', async () => {
    const { recallElevator } = await import('@/lib/actions')
    vi.mocked(recallElevator).mockResolvedValue({ success: true, carId: 'c1', targetFloor: 3 })

    render(<ElevatorRecallForm carId="c1" currentFloor={3} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const checkmark = await screen.findByText('✓')
    expect(checkmark).toBeDefined()
  })

  it('error → shows error text', async () => {
    const { recallElevator } = await import('@/lib/actions')
    vi.mocked(recallElevator).mockResolvedValue({ error: 'Recall failed' })

    render(<ElevatorRecallForm carId="c1" currentFloor={3} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const errText = await screen.findByText('Recall failed')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

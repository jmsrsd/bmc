import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  setDoorState: vi.fn(),
}))

import { DoorLockButton } from '../door-controls'

describe('DoorLockButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('locked state → shows Unlock button', () => {
    render(<DoorLockButton doorId="d1" currentState="LOCKED" />)
    const btn = screen.getByRole('button', { name: /Unlock/i })
    expect(btn).toBeDefined()
  })

  it('unlocked state → shows Lock button', () => {
    render(<DoorLockButton doorId="d1" currentState="UNLOCKED" />)
    const btn = screen.getByRole('button', { name: /Lock/i })
    expect(btn).toBeDefined()
  })

  it('pending → button disabled', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { setDoorState } = await import('@/lib/actions')
    vi.mocked(setDoorState).mockResolvedValue(deferred)

    render(<DoorLockButton doorId="d1" currentState="LOCKED" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button').getAttribute('disabled')).toBe('')

    deferredResolve!({ success: true, state: 'LOCKED', doorId: 'd1' })
  })

  it('success state → no error shown', async () => {
    const { setDoorState } = await import('@/lib/actions')
    vi.mocked(setDoorState).mockResolvedValue({ success: true, state: 'LOCKED', doorId: 'd1' })

    render(<DoorLockButton doorId="d1" currentState="LOCKED" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    await new Promise((r) => setTimeout(r, 50))
    const errorEls = document.querySelectorAll('.text-status-critical')
    expect(errorEls.length).toBe(0)
  })

  it('error state → error text displayed', async () => {
    const { setDoorState } = await import('@/lib/actions')
    vi.mocked(setDoorState).mockResolvedValue({ error: 'Door error' })

    render(<DoorLockButton doorId="d1" currentState="LOCKED" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const errText = await screen.findByText('Door error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })

  it('renders hidden inputs doorId and newState (toggled)', () => {
    render(<DoorLockButton doorId="d1" currentState="LOCKED" />)
    const doorIdInput = document.querySelector('input[name="doorId"]') as HTMLInputElement
    const newStateInput = document.querySelector('input[name="newState"]') as HTMLInputElement
    expect(doorIdInput).not.toBeNull()
    expect(doorIdInput?.value).toBe('d1')
    expect(newStateInput).not.toBeNull()
    expect(newStateInput?.value).toBe('UNLOCKED')
  })
})

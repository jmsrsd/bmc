import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DoorLockButton } from '../door-controls'

vi.mock('@/lib/actions', () => ({
  setDoorState: vi.fn(async () => ({})),
}))

describe('DoorLockButton', () => {
  it('shows Unlock when door is LOCKED', () => {
    render(<DoorLockButton doorId="d1" currentState="LOCKED" />)
    expect(screen.getByText('Unlock')).toBeInTheDocument()
  })

  it('shows Lock when door is UNLOCKED', () => {
    render(<DoorLockButton doorId="d1" currentState="UNLOCKED" />)
    expect(screen.getByText('Lock')).toBeInTheDocument()
  })

  it('shows Lock when door is OPEN', () => {
    render(<DoorLockButton doorId="d1" currentState="OPEN" />)
    expect(screen.getByText('Lock')).toBeInTheDocument()
  })

  it('has hidden inputs for doorId and newState', () => {
    render(<DoorLockButton doorId="door-xyz" currentState="LOCKED" />)
    const doorInput = document.querySelector('input[name="doorId"]') as HTMLInputElement
    expect(doorInput?.value).toBe('door-xyz')
    const stateInput = document.querySelector('input[name="newState"]') as HTMLInputElement
    expect(stateInput?.value).toBe('UNLOCKED')
  })
})

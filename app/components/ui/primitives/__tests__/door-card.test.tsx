import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DoorCard } from '../door-card'

vi.mock('../../door-controls', () => ({
  DoorLockButton: ({ doorId, currentState }: any) => (
    <button data-testid="door-lock-button" data-door-id={doorId} data-state={currentState}>
      {currentState === 'LOCKED' ? 'Unlock' : 'Lock'}
    </button>
  ),
}))

const baseDoor = {
  id: 'd1',
  name: 'Main Entry',
  zone: { name: 'Lobby', floor: 1 },
  state: 'UNLOCKED' as const,
  alarmState: 'NORMAL' as const,
}

describe('DoorCard', () => {
  it('renders door name and location', () => {
    render(<DoorCard door={baseDoor} />)
    expect(screen.getByText('Main Entry')).toBeInTheDocument()
    expect(screen.getByText('Lobby · Floor 1')).toBeInTheDocument()
  })

  it('FORCED state adds critical styling and hides lock button', () => {
    const { container } = render(
      <DoorCard door={{ ...baseDoor, state: 'FORCED' }} />
    )
    // Card gets border-status-critical/50
    expect(container.querySelector('.p-5')).toHaveClass('border-status-critical/50')
    // StatusBadge is critical — rendered text is "FORCED"
    expect(screen.getByText('FORCED')).toBeInTheDocument()
    // State text is critical color
    expect(screen.getByText('Forced')).toHaveClass('text-status-critical')
    // No lock button for forced doors
    expect(screen.queryByTestId('door-lock-button')).not.toBeInTheDocument()
  })

  it('LOCKED state shows warning status and lock button', () => {
    const { container } = render(
      <DoorCard door={{ ...baseDoor, state: 'LOCKED' }} />
    )
    expect(screen.getByText('Locked')).toHaveClass('text-status-warning')
    // DoorLockButton rendered
    const btn = screen.getByTestId('door-lock-button')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('data-door-id', 'd1')
    expect(btn).toHaveAttribute('data-state', 'LOCKED')
  })

  it('UNLOCKED state shows normal status and lock button', () => {
    render(<DoorCard door={{ ...baseDoor, state: 'UNLOCKED' }} />)
    expect(screen.getByText('Unlocked')).toHaveClass('text-status-normal')
    const btn = screen.getByTestId('door-lock-button')
    expect(btn).toHaveAttribute('data-state', 'UNLOCKED')
  })

  it('shows alarm badge when alarmState is not NORMAL', () => {
    const { rerender } = render(
      <DoorCard door={{ ...baseDoor, alarmState: 'FORCED_OPEN' }} />
    )
    expect(screen.getByText('Alarm: FORCED_OPEN')).toBeInTheDocument()
    expect(screen.getByText('Alarm: FORCED_OPEN')).toHaveClass('text-status-critical')

    rerender(<DoorCard door={{ ...baseDoor, alarmState: 'PROPPED_OPEN' }} />)
    expect(screen.getByText('Alarm: PROPPED_OPEN')).toBeInTheDocument()

    rerender(<DoorCard door={{ ...baseDoor, alarmState: 'TAMPER' }} />)
    expect(screen.getByText('Alarm: TAMPER')).toBeInTheDocument()
  })

  it('hides alarm badge when alarmState is NORMAL', () => {
    render(<DoorCard door={baseDoor} />)
    expect(screen.queryByText(/Alarm/)).not.toBeInTheDocument()
  })
})

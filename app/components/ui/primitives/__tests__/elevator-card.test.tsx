import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ElevatorCard } from '../elevator-card'

const baseCar = {
  id: 'e1',
  name: 'Elevator A',
  state: 'IDLE' as const,
  floor: 3,
  direction: 'IDLE' as const,
  doorState: 'CLOSED' as const,
  recallFloor: null,
}

describe('ElevatorCard', () => {
  it('renders car name', () => {
    render(<ElevatorCard car={baseCar} recallForm={<div />} clearRecallBtn={<div />} />)
    expect(screen.getByText('Elevator A')).toBeInTheDocument()
  })

  it('shows state badge with IDLE status (normal)', () => {
    render(<ElevatorCard car={baseCar} recallForm={<div />} clearRecallBtn={<div />} />)
    expect(screen.getByText('IDLE')).toBeInTheDocument()
  })

  it('FAULT state → critical status on badge', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, state: 'FAULT' }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    // StatusBadge with critical renders bg-status-critical/10 + text-status-critical
    const badge = screen.getByText('FAULT').closest('span')
    expect(badge).toHaveClass('bg-status-critical/10')
    expect(badge).toHaveClass('text-status-critical')
  })

  it('RECALL state → warning status on badge', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, state: 'RECALL', recallFloor: 1 }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    const badge = screen.getByText('RECALL').closest('span')
    expect(badge).toHaveClass('bg-status-warning/10')
    expect(badge).toHaveClass('text-status-warning')
  })

  it('RECALL state adds border-status-warning/40 to card', () => {
    const { container } = render(
      <ElevatorCard
        car={{ ...baseCar, state: 'RECALL', recallFloor: 1 }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    // Card has p-5 + the recall border
    const card = container.querySelector('.p-5')
    expect(card).toHaveClass('border-status-warning/40')
  })

  it('UP direction renders ArrowUp icon', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, direction: 'UP' }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    const container = document.querySelector('.lucide-arrow-up')
    expect(container).toBeInTheDocument()
  })

  it('DOWN direction renders ArrowDown icon', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, direction: 'DOWN' }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    const container = document.querySelector('.lucide-arrow-down')
    expect(container).toBeInTheDocument()
  })

  it('IDLE direction renders dash placeholder', () => {
    render(
      <ElevatorCard car={baseCar} recallForm={<div />} clearRecallBtn={<div />} />
    )
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('doorState OPEN renders DoorOpen icon and "Open" text', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, doorState: 'OPEN' }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    expect(document.querySelector('.lucide-door-open')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('doorState CLOSED renders DoorClosed icon and "Closed" text', () => {
    render(
      <ElevatorCard car={baseCar} recallForm={<div />} clearRecallBtn={<div />} />
    )
    expect(document.querySelector('.lucide-door-closed')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('shows floor number in MetricTile', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, floor: 7 }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Floor')).toBeInTheDocument()
  })

  it('shows recall info when state is RECALL and recallFloor > 0', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, state: 'RECALL', recallFloor: 2 }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    expect(screen.getByText('Recalled to floor 2')).toBeInTheDocument()
  })

  it('hides recall info when state is RECALL but recallFloor is 0', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, state: 'RECALL', recallFloor: 0 }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    expect(screen.queryByText(/Recalled/)).not.toBeInTheDocument()
  })

  it('hides recall info when state is RECALL but recallFloor is null', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, state: 'RECALL', recallFloor: null }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    expect(screen.queryByText(/Recalled/)).not.toBeInTheDocument()
  })

  it('hides recall info for non-RECALL state even with recallFloor', () => {
    render(
      <ElevatorCard
        car={{ ...baseCar, state: 'IDLE', recallFloor: 3 }}
        recallForm={<div />}
        clearRecallBtn={<div />}
      />
    )
    expect(screen.queryByText(/Recalled/)).not.toBeInTheDocument()
  })

  it('renders recallForm slot', () => {
    render(
      <ElevatorCard
        car={baseCar}
        recallForm={<div data-testid="recall-form">Recall Form</div>}
        clearRecallBtn={<div />}
      />
    )
    expect(screen.getByTestId('recall-form')).toBeInTheDocument()
  })

  it('renders clearRecallBtn slot', () => {
    render(
      <ElevatorCard
        car={baseCar}
        recallForm={<div />}
        clearRecallBtn={<div data-testid="clear-recall">Clear</div>}
      />
    )
    expect(screen.getByTestId('clear-recall')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  clearElevatorRecall: vi.fn(),
}))

import { ElevatorClearRecallButton } from '../elevator-clear-recall'

describe('ElevatorClearRecallButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders button with Clear Recall text', () => {
    render(<ElevatorClearRecallButton carId="c1" />)
    const btn = screen.getByRole('button', { name: /Clear Recall/i })
    expect(btn).toBeDefined()
  })

  it('pending → disabled + ...', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { clearElevatorRecall } = await import('@/lib/actions')
    vi.mocked(clearElevatorRecall).mockResolvedValue(deferred)

    render(<ElevatorClearRecallButton carId="c1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const btn = screen.getByRole('button')
    expect(btn.getAttribute('disabled')).toBe('')
    expect(btn.textContent).toContain('...')

    deferredResolve!({ success: true, carId: 'c1' })
  })

  it('success → shows checkmark', async () => {
    const { clearElevatorRecall } = await import('@/lib/actions')
    vi.mocked(clearElevatorRecall).mockResolvedValue({ success: true, carId: 'c1' })

    render(<ElevatorClearRecallButton carId="c1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const checkmark = await screen.findByText('✓')
    expect(checkmark).toBeDefined()
  })

  it('error → shows error text', async () => {
    const { clearElevatorRecall } = await import('@/lib/actions')
    vi.mocked(clearElevatorRecall).mockResolvedValue({ error: 'Clear error' })

    render(<ElevatorClearRecallButton carId="c1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const errText = await screen.findByText('Clear error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

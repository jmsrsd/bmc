import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  acknowledgeAlarm: vi.fn(),
}))

import { AcknowledgeButton } from '../ack-button'

describe('AcknowledgeButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders button with Acknowledge text', () => {
    render(<AcknowledgeButton alarmId="a1" />)
    const btn = screen.getByRole('button', { name: /Acknowledge/i })
    expect(btn).toBeDefined()
  })

  it('renders Check icon', () => {
    render(<AcknowledgeButton alarmId="a1" />)
    const svg = document.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('pending → disabled + Acknowledging... text', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { acknowledgeAlarm } = await import('@/lib/actions')
    vi.mocked(acknowledgeAlarm).mockResolvedValue(deferred)

    render(<AcknowledgeButton alarmId="a1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const btn = screen.getByRole('button')
    expect(btn.getAttribute('disabled')).toBe('')
    expect(btn.textContent).toContain('Acknowledging...')

    deferredResolve!({ success: true, alarmId: 'a1' })
  })

  it('success → shows Acknowledged text', async () => {
    const { acknowledgeAlarm } = await import('@/lib/actions')
    vi.mocked(acknowledgeAlarm).mockResolvedValue({ success: true, alarmId: 'a1' })

    render(<AcknowledgeButton alarmId="a1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const ackText = await screen.findByText('Acknowledged')
    expect(ackText).toBeDefined()
  })

  it('error → shows error text', async () => {
    const { acknowledgeAlarm } = await import('@/lib/actions')
    vi.mocked(acknowledgeAlarm).mockResolvedValue({ error: 'Alarm error' })

    render(<AcknowledgeButton alarmId="a1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const errText = await screen.findByText('Alarm error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

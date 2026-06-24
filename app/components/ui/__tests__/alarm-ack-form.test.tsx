import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  acknowledgeAlarm: vi.fn(),
}))

import { AlarmAckForm } from '../alarm-ack-form'

describe('AlarmAckForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders hidden input with alarmId', () => {
    render(<AlarmAckForm alarmId="a1" />)
    const hiddenInput = document.querySelector('input[name="alarmId"]') as HTMLInputElement
    expect(hiddenInput).not.toBeNull()
    expect(hiddenInput?.value).toBe('a1')
    expect(hiddenInput?.type).toBe('hidden')
  })

  it('renders Acknowledge button text', () => {
    render(<AlarmAckForm alarmId="a1" />)
    expect(screen.getByRole('button', { name: /Acknowledge/i })).toBeDefined()
  })

  it('pending state → button disabled', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { acknowledgeAlarm } = await import('@/lib/actions')
    vi.mocked(acknowledgeAlarm).mockResolvedValue(deferred)

    render(<AlarmAckForm alarmId="a1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const btn = screen.getByRole('button')
    expect(btn.getAttribute('disabled')).toBe('')
    expect(btn.textContent).toContain('Acking')

    deferredResolve!({ success: true, alarmId: 'a1' })
  })

  it('success state → shows checkmark span', async () => {
    const { acknowledgeAlarm } = await import('@/lib/actions')
    vi.mocked(acknowledgeAlarm).mockResolvedValue({ success: true, alarmId: 'a1' })

    render(<AlarmAckForm alarmId="a1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const checkmark = await screen.findByText('✓')
    expect(checkmark).toBeDefined()
    expect(checkmark.className).toContain('text-status-normal')
  })

  it('error state → shows error text', async () => {
    const { acknowledgeAlarm } = await import('@/lib/actions')
    vi.mocked(acknowledgeAlarm).mockResolvedValue({ error: 'Failed' })

    render(<AlarmAckForm alarmId="a1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const errorText = await screen.findByText('Failed')
    expect(errorText).toBeDefined()
    expect(errorText.className).toContain('text-status-critical')
  })
})

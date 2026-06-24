import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/actions', () => ({
  clearFireAlarm: vi.fn(),
}))

import { FireClearForm } from '../fire-clear-form'

describe('FireClearForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders button with Clear Alarm text', () => {
    render(<FireClearForm panelId="p1" />)
    const btn = screen.getByRole('button', { name: /Clear Alarm/i })
    expect(btn).toBeDefined()
  })

  it('renders hidden panelId input', () => {
    render(<FireClearForm panelId="p1" />)
    const input = document.querySelector('input[name="panelId"]') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input?.value).toBe('p1')
    expect(input?.type).toBe('hidden')
  })

  it('pending → shows Clearing...', async () => {
    let deferredResolve!: (v: unknown) => void
    const deferred = new Promise((resolve) => { deferredResolve = resolve })
    const { clearFireAlarm } = await import('@/lib/actions')
    vi.mocked(clearFireAlarm).mockResolvedValue(deferred)

    render(<FireClearForm panelId="p1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const btn = screen.getByRole('button')
    expect(btn.getAttribute('disabled')).toBe('')
    expect(btn.textContent).toContain('Clearing...')

    deferredResolve!({ success: true, panelId: 'p1' })
  })

  it('success → shows Alarm cleared text', async () => {
    const { clearFireAlarm } = await import('@/lib/actions')
    vi.mocked(clearFireAlarm).mockResolvedValue({ success: true, panelId: 'p1' })

    render(<FireClearForm panelId="p1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const msg = await screen.findByText('Alarm cleared')
    expect(msg).toBeDefined()
    expect(msg.className).toContain('text-status-normal')
  })

  it('error → shows error text', async () => {
    const { clearFireAlarm } = await import('@/lib/actions')
    vi.mocked(clearFireAlarm).mockResolvedValue({ error: 'Fire clear error' })

    render(<FireClearForm panelId="p1" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    const errText = await screen.findByText('Fire clear error')
    expect(errText).toBeDefined()
    expect(errText.className).toContain('text-status-critical')
  })
})

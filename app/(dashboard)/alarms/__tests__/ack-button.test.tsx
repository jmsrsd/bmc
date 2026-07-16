import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

const mockUseActionState = vi.hoisted(() => vi.fn())

vi.mock('react', async () => {
  const actualReact = await vi.importActual('react')
  return {
    ...actualReact,
    useActionState: mockUseActionState,
  }
})

vi.mock('@/lib/actions', async () => ({
  acknowledgeAlarm: vi.fn().mockResolvedValue({ success: true }),
}))

import { AckButton } from '../ack-button'

describe('ack-button.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders button with hidden inputs when not acknowledged', () => {
    mockUseActionState.mockImplementation(() => [null, vi.fn(), false])

    const html = renderToString(<AckButton alarmId="a1" />)
    
    expect(html).toContain('Acknowledge')
    expect(html).toContain('type="hidden"')
    expect(html).toContain('alarmId')
    expect(html).toContain('a1')
  })

  it('renders "Acknowledged" when success state', () => {
    mockUseActionState.mockImplementation(() => [{ success: true }, vi.fn(), false])

    const html = renderToString(<AckButton alarmId="a1" />)
    
    expect(html).toContain('Acknowledged')
    expect(html).not.toContain('button')
  })

  it('renders disabled button when pending', () => {
    mockUseActionState.mockImplementation(() => [null, vi.fn(), true])

    const html = renderToString(<AckButton alarmId="a1" />)
    
    expect(html).toContain('disabled')
    expect(html).toContain('...')
  })

  it('renders error message', () => {
    mockUseActionState.mockImplementation(() => [{ error: 'Failed' }, vi.fn(), false])

    const html = renderToString(<AckButton alarmId="a1" />)
    
    expect(html).toContain('Failed')
    expect(html).toContain('text-critical')
  })
})
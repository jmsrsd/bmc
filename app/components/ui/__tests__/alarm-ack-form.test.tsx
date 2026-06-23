import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlarmAckForm } from '../alarm-ack-form'

vi.mock('@/lib/actions', () => ({
  acknowledgeAlarm: vi.fn(async () => ({})),
}))

describe('AlarmAckForm', () => {
  it('renders Acknowledge button', () => {
    render(<AlarmAckForm alarmId="alarm-1" />)
    expect(screen.getByText('Acknowledge')).toBeInTheDocument()
  })

  it('has hidden alarmId input', () => {
    render(<AlarmAckForm alarmId="alarm-test-42" />)
    const hidden = document.querySelector('input[name="alarmId"]') as HTMLInputElement
    expect(hidden?.value).toBe('alarm-test-42')
  })
})

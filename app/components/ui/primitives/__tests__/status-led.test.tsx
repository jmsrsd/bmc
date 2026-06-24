import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatusLed } from '../status-led'

describe('StatusLed', () => {
  it('renders with normal status', () => {
    const { container } = render(<StatusLed status="normal" />)
    expect(container.firstChild).toHaveClass('bg-status-normal')
  })

  it('renders with warning status', () => {
    const { container } = render(<StatusLed status="warning" />)
    expect(container.firstChild).toHaveClass('bg-status-warning')
  })

  it('renders with critical status', () => {
    const { container } = render(<StatusLed status="critical" />)
    expect(container.firstChild).toHaveClass('bg-status-critical')
  })

  it('renders with unknown status', () => {
    const { container } = render(<StatusLed status="unknown" />)
    expect(container.firstChild).toHaveClass('bg-gray-500')
  })

  it('has correct aria-label matching status', () => {
    const { container } = render(<StatusLed status="critical" />)
    expect(container.firstChild).toHaveAttribute('aria-label', 'critical status')
  })

  it('accepts custom className', () => {
    const { container } = render(<StatusLed status="normal" className="my-custom" />)
    expect(container.firstChild).toHaveClass('bg-status-normal')
    expect(container.firstChild).toHaveClass('my-custom')
  })
})

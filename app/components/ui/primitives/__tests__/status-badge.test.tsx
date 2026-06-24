import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../status-badge'

describe('StatusBadge', () => {
  it('renders children text', () => {
    render(<StatusBadge status="normal">All Good</StatusBadge>)
    expect(screen.getByText('All Good')).toBeInTheDocument()
  })

  it('critical status applies critical color classes', () => {
    const { container } = render(<StatusBadge status="critical">Critical</StatusBadge>)
    expect(container.firstChild).toHaveClass('bg-status-critical/10')
    expect(container.firstChild).toHaveClass('text-status-critical')
  })

  it('warning status applies warning color classes', () => {
    const { container } = render(<StatusBadge status="warning">Warning</StatusBadge>)
    expect(container.firstChild).toHaveClass('bg-status-warning/10')
    expect(container.firstChild).toHaveClass('text-status-warning')
  })

  it('info status maps to active color classes', () => {
    const { container } = render(<StatusBadge status="info">Info</StatusBadge>)
    expect(container.firstChild).toHaveClass('bg-status-active/10')
    expect(container.firstChild).toHaveClass('text-status-active')
  })

  it('normal status applies normal color classes', () => {
    const { container } = render(<StatusBadge status="normal">Normal</StatusBadge>)
    expect(container.firstChild).toHaveClass('bg-status-normal/10')
    expect(container.firstChild).toHaveClass('text-status-normal')
  })

  it('renders StatusLed with correct mapping: info->normal', () => {
    const { container } = render(<StatusBadge status="info">Info</StatusBadge>)
    const led = container.querySelector('span > span')
    expect(led).toHaveClass('bg-status-normal')
  })

  it('renders StatusLed with critical mapping', () => {
    const { container } = render(<StatusBadge status="critical">Critical</StatusBadge>)
    const led = container.querySelector('span > span')
    expect(led).toHaveClass('bg-status-critical')
  })

  it('renders StatusLed with warning mapping', () => {
    const { container } = render(<StatusBadge status="warning">Warning</StatusBadge>)
    const led = container.querySelector('span > span')
    expect(led).toHaveClass('bg-status-warning')
  })

  it('renders StatusLed with normal mapping for normal status', () => {
    const { container } = render(<StatusBadge status="normal">Normal</StatusBadge>)
    const led = container.querySelector('span > span')
    expect(led).toHaveClass('bg-status-normal')
  })
})

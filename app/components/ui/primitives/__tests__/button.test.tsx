import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('renders with default primary variant', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button', { name: /click/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-status-active')
  })

  it('primary variant has correct class', () => {
    render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-status-active')
  })

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-bg-surface')
  })

  it('renders status-active variant', () => {
    render(<Button variant="status-active">Active</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-status-active')
  })

  it('renders status-warning variant', () => {
    render(<Button variant="status-warning">Warning</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-status-warning')
  })

  it('renders status-critical variant', () => {
    render(<Button variant="status-critical">Critical</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-status-critical')
  })

  it('renders status-normal variant', () => {
    render(<Button variant="status-normal">Normal</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-status-normal')
  })

  it('disabled state sets disabled attribute and adds opacity class', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('disabled:opacity-50')
    expect(btn).toHaveClass('disabled:cursor-not-allowed')
  })

  it('custom className appended', () => {
    render(<Button className="my-btn">Styled</Button>)
    expect(screen.getByRole('button')).toHaveClass('my-btn')
  })

  it('onClick fires on click', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders children text', () => {
    render(<Button>Hello</Button>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../card'

describe('Card', () => {
  it('renders children text', () => {
    render(<Card>Hello World</Card>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('defaults to bg-surface when not elevated', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild).toHaveClass('bg-surface')
    expect(container.firstChild).not.toHaveClass('bg-bg-elevated')
  })

  it('elevated variant uses bg-bg-elevated', () => {
    const { container } = render(<Card elevated>Content</Card>)
    expect(container.firstChild).toHaveClass('bg-bg-elevated')
    expect(container.firstChild).not.toHaveClass('bg-surface')
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="my-card">Content</Card>)
    expect(container.firstChild).toHaveClass('bg-surface')
    expect(container.firstChild).toHaveClass('my-card')
  })
})

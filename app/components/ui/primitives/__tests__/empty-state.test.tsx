import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../empty-state'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="No data" description="Try adjusting filters" />)
    expect(screen.getByText('Try adjusting filters')).toBeInTheDocument()
  })

  it('no description renders no description element', () => {
    const { container } = render(<EmptyState title="No data" />)
    const descEls = container.querySelectorAll('.text-sm')
    expect(descEls.length).toBe(0)
  })

  it('renders icon when provided', () => {
    render(<EmptyState title="No data" icon={<span data-testid="empty-icon">🔍</span>} />)
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument()
  })

  it('no icon renders no icon wrapper', () => {
    const { container } = render(<EmptyState title="No data" />)
    const iconDiv = container.querySelector('.mb-3')
    expect(iconDiv).toBeNull()
  })
})

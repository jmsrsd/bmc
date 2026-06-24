import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '../page-header'

describe('PageHeader', () => {
  it('renders title text', () => {
    render(<PageHeader title="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Dashboard" subtitle="Building A" />)
    expect(screen.getByText('Building A')).toBeInTheDocument()
  })

  it('no subtitle renders no subtitle element', () => {
    const { container } = render(<PageHeader title="Dashboard" />)
    const subtitleEls = container.querySelectorAll('.text-muted-foreground')
    expect(subtitleEls.length).toBe(0)
  })

  it('subtitle 0 renders (not falsy-bypassed — uses != null)', () => {
    render(<PageHeader title="Dashboard" subtitle={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

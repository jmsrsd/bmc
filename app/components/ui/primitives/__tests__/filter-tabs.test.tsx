import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterTabs, PillTabs } from '../filter-tabs'

const tabs = [
  { label: 'All', href: '/?filter=all', active: true },
  { label: 'Active', href: '/?filter=active', active: false },
  { label: 'Inactive', href: '/?filter=inactive', active: false },
]

describe('FilterTabs', () => {
  it('renders all tabs', () => {
    render(<FilterTabs tabs={tabs} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('active tab gets active class (border-status-active)', () => {
    render(<FilterTabs tabs={tabs} />)
    const allLink = screen.getByText('All')
    // The <a> parent has the class
    expect(allLink.closest('a')).toHaveClass('border-status-active')
  })

  it('inactive tab gets inactive class (border-transparent)', () => {
    render(<FilterTabs tabs={tabs} />)
    const activeLink = screen.getByText('Active')
    expect(activeLink.closest('a')).toHaveClass('border-transparent')
    const inactiveLink = screen.getByText('Inactive')
    expect(inactiveLink.closest('a')).toHaveClass('border-transparent')
  })
})

describe('PillTabs', () => {
  it('renders all tabs', () => {
    render(<PillTabs tabs={tabs} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('active tab uses bg-status-active', () => {
    render(<PillTabs tabs={tabs} />)
    const allLink = screen.getByText('All')
    expect(allLink.closest('a')).toHaveClass('bg-status-active')
  })

  it('inactive tab uses bg-bg-surface', () => {
    render(<PillTabs tabs={tabs} />)
    const activeLink = screen.getByText('Active')
    expect(activeLink.closest('a')).toHaveClass('bg-bg-surface')
    const inactiveLink = screen.getByText('Inactive')
    expect(inactiveLink.closest('a')).toHaveClass('bg-bg-surface')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '../stat-card'

describe('StatCard', () => {
  it('renders label text', () => {
    render(<StatCard label="Temperature" value="72°F" />)
    expect(screen.getByText('Temperature')).toBeInTheDocument()
  })

  it('renders value text', () => {
    render(<StatCard label="Temperature" value="72°F" />)
    expect(screen.getByText('72°F')).toBeInTheDocument()
  })

  it('highlight prop adds status-critical classes to value and icon wrapper', () => {
    const { container } = render(
      <StatCard label="Alerts" value="5" highlight icon={<span>!</span>} />
    )
    const valueEl = container.querySelector('.text-2xl')
    expect(valueEl).toHaveClass('text-status-critical')

    const iconWrapper = container.querySelector('.rounded-lg')
    expect(iconWrapper).toHaveClass('bg-status-critical/10')
  })

  it('no highlight uses default bg-bg-elevated/50 for icon wrapper', () => {
    const { container } = render(
      <StatCard label="Temp" value="72" icon={<span>🔥</span>} />
    )
    const iconWrapper = container.querySelector('.rounded-lg')
    expect(iconWrapper).toHaveClass('bg-bg-elevated/50')
  })

  it('renders icon inside icon wrapper', () => {
    render(
      <StatCard label="Temp" value="72" icon={<span data-testid="test-icon">🔥</span>} />
    )
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('renders children fallback when value is not provided', () => {
    render(
      <StatCard label="Temp" value={undefined as any}>
        <span>Fallback</span>
      </StatCard>
    )
    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })

  it('no icon renders no icon wrapper div', () => {
    const { container } = render(<StatCard label="Temp" value="72" />)
    const iconWrappers = container.querySelectorAll('.rounded-lg')
    // Only the outer card has rounded-xl, but there's a p-3 rounded-lg icon wrapper
    // when no icon, no such div exists
    const iconDiv = container.querySelector('.p-3.rounded-lg')
    expect(iconDiv).toBeNull()
  })
})

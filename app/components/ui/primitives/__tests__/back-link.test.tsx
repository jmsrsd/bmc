import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BackLink } from '../back-link'

describe('BackLink', () => {
  it('renders link with correct href', () => {
    render(<BackLink href="/building/1" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/building/1')
  })

  it('renders default label Dashboard', () => {
    render(<BackLink href="/" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders custom label override', () => {
    render(<BackLink href="/" label="Settings" />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('contains ArrowLeft icon (checks lucide-react ArrowLeft is rendered)', () => {
    const { container } = render(<BackLink href="/" />)
    // lucide-react ArrowLeft renders as inline SVG
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('w-4')
    expect(svg).toHaveClass('h-4')
  })

  it('renders as anchor/link element with correct href attribute', () => {
    render(<BackLink href="/dashboard" />)
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/dashboard')
  })
})

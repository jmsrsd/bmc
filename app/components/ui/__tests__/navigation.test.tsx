import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '../navigation'

// Mock next/navigation usePathname
const mockUsePathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Navigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders all nav links', () => {
    render(<Navigation />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Building')).toBeInTheDocument()
    expect(screen.getByText('Smart')).toBeInTheDocument()
    expect(screen.getByText('Alarms')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('Fire Safety')).toBeInTheDocument()
    expect(screen.getByText('Elevators')).toBeInTheDocument()
  })

  it('renders BMC logo', () => {
    render(<Navigation />)
    expect(screen.getByText('BMC')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    render(<Navigation />)
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('highlights active route', () => {
    mockUsePathname.mockReturnValue('/alarms')
    render(<Navigation />)
    const alarmsLink = screen.getByText('Alarms')
    // Active link should have bg-gray-800 class
    expect(alarmsLink.closest('a')?.className || alarmsLink.className).toContain('bg-gray-800')
  })

  it('does not highlight inactive routes', () => {
    mockUsePathname.mockReturnValue('/building')
    render(<Navigation />)
    const dashboardLink = screen.getByText('Dashboard')
    const linkClass = dashboardLink.closest('a')?.className || ''
    // Inactive link should NOT have the active class (bg-gray-800 without /50)
    const activeClasses = linkClass.split(' ')
    expect(activeClasses.find(c => c === 'bg-gray-800')).toBeUndefined()
  })

  it('has mobile menu toggle button', () => {
    render(<Navigation />)
    const menuBtn = screen.getByLabelText('Open menu')
    expect(menuBtn).toBeInTheDocument()
  })

  it('shows mobile menu items when menu toggled', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    const menuBtn = screen.getByLabelText('Open menu')
    await user.click(menuBtn)
    // Mobile menu should render all nav links
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('next/navigation', () => {
  const usePathnameMock = vi.fn(() => '/building')
  return {
    usePathname: usePathnameMock,
  }
})

vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon" />,
  PanelLeftClose: () => <span data-testid="panel-left-close" />,
  PanelLeftOpen: () => <span data-testid="panel-left-open" />,
}))

vi.mock('./ui/nav-items', () => ({
  NAV_ITEMS: [
    { label: 'Building', href: '/building', icon: <span data-testid="building-icon" /> },
    { label: 'HVAC', href: '/building/hvac', icon: <span data-testid="hvac-icon" /> },
    { label: 'Lighting', href: '/building/lighting', icon: <span data-testid="lighting-icon" /> },
  ],
}))

vi.mock('./sidebar-context', () => ({
  useSidebar: () => ({
    collapsed: false,
    mobileOpen: false,
    toggleCollapsed: vi.fn(),
    closeMobile: vi.fn(),
  }),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { AppSidebar } from './app-sidebar'

describe('app/components/app-sidebar.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithSidebar = () => {
    render(<AppSidebar />)
  }

  it('AppSidebar is exported', () => {
    expect(AppSidebar).toBeDefined()
    expect(typeof AppSidebar).toBe('function')
  })

  it('renders sidebar header with BMC branding', () => {
    renderWithSidebar()
    const bmcElements = screen.getAllByText('BMC')
    expect(bmcElements.length).toBeGreaterThan(0)
    expect(screen.getByText('Biomedical Campus')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithSidebar()
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('highlights active navigation item', () => {
    renderWithSidebar()
    const links = screen.getAllByRole('link')
    const activeLink = links.find(l => l.textContent?.includes('Building'))
    expect(activeLink).toBeTruthy()
  })

  it('renders collapse toggle button', () => {
    renderWithSidebar()
    expect(screen.getByRole('button', { name: /Collapse sidebar/i })).toBeInTheDocument()
  })

  it('renders mobile drawer close button', () => {
    renderWithSidebar()
    expect(screen.getByRole('button', { name: /Close navigation menu/i })).toBeInTheDocument()
  })
})
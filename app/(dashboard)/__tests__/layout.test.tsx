import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('@/components/sidebar-context', async () => ({
  SidebarProvider: ({ children }) => <div>{children}</div>,
}))

vi.mock('@/components/app-sidebar', async () => ({
  AppSidebar: () => <div data-testid="sidebar" />,
}))

vi.mock('@/components/mobile-top-bar', async () => ({
  MobileTopBar: () => <div data-testid="mobile-top-bar" />,
}))

describe('app/(dashboard)/layout.tsx - component export', () => {
  it('exports DashboardLayout component', async () => {
    const { default: DashboardLayout } = await import('../layout.tsx')
    expect(DashboardLayout).toBeDefined()
    expect(typeof DashboardLayout).toBe('function')
  })

  it('renders sidebar, mobile top bar, and children', async () => {
    const { default: DashboardLayout } = await import('../layout.tsx')
    const html = renderToString(<DashboardLayout children={<p>Test content</p>} />)
    expect(html).toContain('Test content')
    expect(html).toContain('sidebar')
    expect(html).toContain('mobile-top-bar')
  })
})
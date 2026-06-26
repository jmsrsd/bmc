import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

// Mock lucide-react icons used in the sidebar
vi.mock('lucide-react', () => ({
  Menu: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-menu' }),
  X: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-x' }),
  PanelLeftOpen: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-panel-open' }),
  PanelLeftClose: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-panel-close' }),
  Building2: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-building' }),
  Thermometer: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-thermo' }),
  Lightbulb: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-bulb' }),
  Shield: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-shield' }),
  Bell: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-bell' }),
  Flame: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-flame' }),
  ArrowUpDown: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-elevator' }),
  Zap: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'icon-zap' }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...rest }: any) =>
    React.createElement('a', { ...rest, href, className }, children),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/building',
}))

import { SidebarProvider, useSidebar } from '@/components/sidebar-context'
import { AppSidebar } from '@/components/app-sidebar'

// ─── Helper that renders AppSidebar within SidebarProvider ───
function renderSidebar() {
  return renderToString(
    React.createElement(SidebarProvider, null,
      React.createElement(AppSidebar),
    ),
  )
}

function TestConsumer() {
  const { collapsed, mobileOpen, toggleCollapsed } = useSidebar()
  return React.createElement('div', { 'data-testid': 'consumer' },
    `collapsed:${collapsed},mobileOpen:${mobileOpen},toggle:${typeof toggleCollapsed}`,
  )
}

describe('SidebarProvider', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(SidebarProvider, null,
        React.createElement('div', { 'data-testid': 'child' }),
      ),
    )
    expect(html).toContain('data-testid="child"')
  })

  it('provides useSidebar with default state', () => {
    const html = renderToString(
      React.createElement(SidebarProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('collapsed:false')
    expect(html).toContain('mobileOpen:false')
    expect(html).toContain('toggle:function')
  })

  it('throws when useSidebar is used outside provider', () => {
    expect(() => renderToString(React.createElement(TestConsumer))).toThrow(
      'useSidebar must be used within SidebarProvider',
    )
  })
})

describe('AppSidebar - Desktop', () => {
  it('renders desktop sidebar with md:flex class', () => {
    const html = renderSidebar()
    const asidePos = html.indexOf('<aside')
    const asideSection = html.slice(asidePos, html.indexOf('</aside>'))
    expect(asideSection).toContain('hidden')
    expect(asideSection).toContain('md:flex')
  })

  it('shows expanded sidebar by default (w-56)', () => {
    const html = renderSidebar()
    const asideSection = html.slice(html.indexOf('<aside'), html.indexOf('</aside>'))
    expect(asideSection).toContain('w-56')
    expect(asideSection).not.toContain('w-16')
  })

  it('renders all 8 nav items in desktop sidebar and mobile drawer (16 total)', () => {
    const html = renderSidebar()
    const links = html.match(/<a\s/g) || []
    expect(links.length).toBe(16)
    expect(html).toContain('Building')
    expect(html).toContain('Energy')
  })

  it('renders collapse toggle button', () => {
    const html = renderSidebar()
    expect(html).toContain('Collapse sidebar')
    expect(html).toContain('data-testid="icon-panel-close"')
  })

  it('renders BMC branding', () => {
    const html = renderSidebar()
    expect(html).toContain('BMC')
    expect(html).toContain('Biomedical Campus')
  })

  it('renders all 8 icons (one per nav item)', () => {
    const html = renderSidebar()
    const iconIds = [
      'data-testid="icon-building"',
      'data-testid="icon-thermo"',
      'data-testid="icon-bulb"',
      'data-testid="icon-shield"',
      'data-testid="icon-bell"',
      'data-testid="icon-flame"',
      'data-testid="icon-elevator"',
      'data-testid="icon-zap"',
    ]
    for (const id of iconIds) {
      expect(html).toContain(id)
    }
  })
})

describe('AppSidebar - Mobile off-canvas', () => {
  it('renders md:hidden wrapper', () => {
    const html = renderSidebar()
    expect(html).toContain('md:hidden')
  })

  it('drawer is hidden by default (-translate-x-full)', () => {
    const html = renderSidebar()
    expect(html).toContain('-translate-x-full')
  })

  it('drawer has close button', () => {
    const html = renderSidebar()
    expect(html).toContain('Close navigation menu')
    expect(html).toContain('data-testid="icon-x"')
  })

  it('mobile drawer contains all nav items (16 total incl desktop)', () => {
    const html = renderSidebar()
    const links = html.match(/<a\s/g) || []
    expect(links.length).toBe(16)
    expect(html).toContain('Building')
    expect(html).toContain('Energy')
  })

  it('does NOT contain burger button (moved to MobileTopBar)', () => {
    const html = renderSidebar()
    expect(html).not.toContain('Open navigation menu')
    expect(html).not.toContain('data-testid="icon-menu"')
  })
})

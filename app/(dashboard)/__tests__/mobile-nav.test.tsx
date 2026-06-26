import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('lucide-react', () => ({
  Menu: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'menu-icon' }),
  X: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'x-icon' }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) =>
    React.createElement('a', { ...rest, href }, children),
}))

import { MobileNav } from '@/components/mobile-nav'

const items = [
  { href: '/building', label: 'Building' },
  { href: '/building/hvac', label: 'HVAC' },
]

describe('MobileNav', () => {
  it('renders hamburger button visible only on mobile (md:hidden)', () => {
    const html = renderToString(React.createElement(MobileNav, { items }))
    expect(html).toContain('md:hidden')
    expect(html).toContain('Open navigation menu')
  })

  it('drawer is hidden by default (not rendered server-side or has -translate-x-full)', () => {
    const html = renderToString(React.createElement(MobileNav, { items }))
    // The drawer div should exist with -translate-x-full
    expect(html).toContain('-translate-x-full')

    // Check drawer container has md:hidden
    const drawerParts = html.split('-translate-x-full')
    expect(drawerParts[0]).toContain('md:hidden')
  })

  it('drawer contains all nav items as links', () => {
    const html = renderToString(React.createElement(MobileNav, { items }))
    // Each nav item renders as an <a>
    const links = html.match(/<a\s/g) || []
    expect(links.length).toBe(items.length)
    expect(html).toContain('Building')
    expect(html).toContain('HVAC')
  })

  it('renders BMC heading in drawer', () => {
    const html = renderToString(React.createElement(MobileNav, { items }))
    expect(html).toContain('BMC')
  })

  it('has close button with X icon', () => {
    const html = renderToString(React.createElement(MobileNav, { items }))
    expect(html).toContain('Close navigation menu')
    expect(html).toContain('data-testid="x-icon"')
  })
})

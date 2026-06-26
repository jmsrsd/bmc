import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...rest }: any) =>
    React.createElement('a', { ...rest, href, className }, children),
}))

vi.mock('@/components/mobile-nav', () => ({
  MobileNav: ({ items }: any) =>
    React.createElement('div', { 'data-testid': 'mobile-nav' }, `items:${items.length}`),
}))

import DashboardLayout from '../layout'

describe('DashboardLayout - responsive sidebar', () => {
  it('renders MobileNav component in the tree', () => {
    const html = renderToString(
      React.createElement(DashboardLayout, { children: React.createElement('div') }),
    )
    expect(html).toContain('data-testid="mobile-nav"')
    expect(html).toContain('items:8')
  })

  it('nav has "hidden" class for mobile (hidden by default, visible on md+)', () => {
    const tree = DashboardLayout({ children: React.createElement('div') }) as React.ReactElement
    const children = (tree.props as any).children as React.ReactElement[]
    const nav = children[1]
    expect(nav.type).toBe('nav')
    const classes = (nav.props as any).className as string
    expect(classes).toContain('hidden')
    expect(classes).toContain('md:flex')
  })

  it('nav links have minimum 44px touch target (py-3 or taller)', () => {
    const tree = DashboardLayout({ children: React.createElement('div') }) as React.ReactElement
    const children = (tree.props as any).children as React.ReactElement[]
    const nav = children[1]
    const linkChildren = (nav.props as any).children as React.ReactElement[]
    const linkElements = linkChildren.filter(
      (c: React.ReactElement) => (c.props as any)?.href,
    )
    for (const link of linkElements) {
      const classes = ((link.props as any).className as string).split(' ')
      const hasPy3 = classes.some((c) => c === 'py-3')
      const hasMinH = classes.some((c) => c.startsWith('min-h-'))
      const hasPy4 = classes.some((c) => c === 'py-4')
      expect(hasPy3 || hasMinH || hasPy4).toBe(true)
    }
  })
})

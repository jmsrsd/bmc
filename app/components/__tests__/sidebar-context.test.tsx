import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'

import { SidebarProvider, useSidebar } from '../sidebar-context'

function TestConsumer() {
  const { collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile } = useSidebar()
  return React.createElement('div', { 'data-testid': 'consumer' },
    `collapsed:${collapsed},mobileOpen:${mobileOpen},toggleCollapsed:${typeof toggleCollapsed},toggleMobile:${typeof toggleMobile},closeMobile:${typeof closeMobile}`,
  )
}

function TestChild({ id }: { id?: string }) {
  return React.createElement('div', { 'data-testid': id ?? 'child' }, 'hello')
}

describe('SidebarProvider', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(SidebarProvider, null,
        React.createElement(TestChild),
      ),
    )
    expect(html).toContain('data-testid="child"')
  })

  it('provides default collapsed=false and mobileOpen=false', () => {
    const html = renderToString(
      React.createElement(SidebarProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('collapsed:false')
    expect(html).toContain('mobileOpen:false')
  })

  it('exposes all three toggle functions', () => {
    const html = renderToString(
      React.createElement(SidebarProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('toggleCollapsed:function')
    expect(html).toContain('toggleMobile:function')
    expect(html).toContain('closeMobile:function')
  })

  it('supports nested children', () => {
    const html = renderToString(
      React.createElement(SidebarProvider, null,
        React.createElement('div', null,
          React.createElement(TestChild, { id: 'a' }),
          React.createElement(TestChild, { id: 'b' }),
        ),
      ),
    )
    expect(html).toContain('data-testid="a"')
    expect(html).toContain('data-testid="b"')
  })
})

describe('useSidebar', () => {
  it('returns context when used inside provider', () => {
    const html = renderToString(
      React.createElement(SidebarProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('collapsed:false')
  })

  it('throws when used outside provider', () => {
    expect(() => renderToString(React.createElement(TestConsumer))).toThrow(
      'useSidebar must be used within SidebarProvider',
    )
  })
})

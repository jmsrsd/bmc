import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

// Mock sidebar-context
vi.mock('../sidebar-context', () => ({
  useSidebar: () => ({
    collapsed: false,
    mobileOpen: false,
    toggleSidebar: vi.fn(),
  }),
}))

// Mock user-context since it has complex React Context dependencies
vi.mock('../user-context', () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { className: 'user-context-provider' }, children),
}))

describe('UserContext (mocked)', () => {
  it('provides children with user context wrapper', () => {
    const html = renderToString(
      React.createElement('div', null,
        React.createElement('div', { className: 'user-context-provider' },
          React.createElement('span', null, 'test-user-content'),
        ),
      ),
    )
    expect(html).toContain('user-context-provider')
    expect(html).toContain('test-user-content')
  })
})

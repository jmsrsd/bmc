import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

// Mock sidebar-context before MobileTopBar import
vi.mock('../sidebar-context', () => ({
  useSidebar: () => ({ toggleMobile: vi.fn() }),
}))

import { MobileTopBar } from '../mobile-top-bar'

describe('MobileTopBar', () => {
  it('renders BMC brand and menu button', () => {
    const html = renderToString(<MobileTopBar />)
    expect(html).toContain('BMC')
    expect(html).toContain('Open navigation menu')
  })
})

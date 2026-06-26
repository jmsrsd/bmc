import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'

import { NAV_ITEMS } from '../nav-items'

describe('NAV_ITEMS', () => {
  it('has 8 items', () => {
    expect(NAV_ITEMS).toHaveLength(8)
  })

  it('includes all required routes', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href)
    expect(hrefs).toContain('/building')
    expect(hrefs).toContain('/building/hvac')
    expect(hrefs).toContain('/building/lighting')
    expect(hrefs).toContain('/building/security')
    expect(hrefs).toContain('/alarms')
    expect(hrefs).toContain('/fire')
    expect(hrefs).toContain('/elevators')
    expect(hrefs).toContain('/energy')
  })

  it('every item has label, href, and icon', () => {
    for (const item of NAV_ITEMS) {
      expect(item.label).toBeTruthy()
      expect(item.href).toBeTruthy()
      expect(item.icon).toBeTruthy()
    }
  })
})

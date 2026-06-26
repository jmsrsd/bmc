import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { SkeletonCard, SkeletonList } from '../skeleton'

describe('SkeletonCard', () => {
  it('renders with default 3 lines', () => {
    const html = renderToString(React.createElement(SkeletonCard))
    const divs = html.match(/<div/g) || []
    // Container + 3 inner divs
    expect(divs.length).toBe(4)
  })

  it('renders animated pulse', () => {
    const html = renderToString(React.createElement(SkeletonCard))
    expect(html).toContain('animate-pulse')
  })
})

describe('SkeletonList', () => {
  it('renders default 3 cards', () => {
    const html = renderToString(React.createElement(SkeletonList))
    expect(html).toContain('animate-pulse')
    // Should have 3 container divs (one per card)
    const pulseDivs = html.match(/animate-pulse/g) || []
    expect(pulseDivs.length).toBe(3)
  })

  it('renders custom count', () => {
    const html = renderToString(React.createElement(SkeletonList, { count: 5 }))
    const pulseDivs = html.match(/animate-pulse/g) || []
    expect(pulseDivs.length).toBe(5)
  })

  it('renders 0 count as empty', () => {
    const html = renderToString(React.createElement(SkeletonList, { count: 0 }))
    const pulseDivs = html.match(/animate-pulse/g) || []
    expect(pulseDivs.length).toBe(0)
  })
})

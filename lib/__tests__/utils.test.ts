import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { relativeTime, dimBarColor } from '../utils'

describe('relativeTime', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns just now for < 1 min', () => {
    vi.setSystemTime(new Date('2026-06-24T12:00:00Z'))
    const d = new Date('2026-06-24T12:00:30Z') // 30s ago
    expect(relativeTime(d)).toBe('just now')
  })

  it('returns Xm ago for minutes', () => {
    vi.setSystemTime(new Date('2026-06-24T12:05:00Z'))
    const d = new Date('2026-06-24T12:02:00Z') // 3m ago
    expect(relativeTime(d)).toBe('3m ago')
  })

  it('returns 1m ago for 1 min', () => {
    vi.setSystemTime(new Date('2026-06-24T12:05:00Z'))
    const d = new Date('2026-06-24T12:04:00Z')
    expect(relativeTime(d)).toBe('1m ago')
  })

  it('returns Xh ago for hours', () => {
    vi.setSystemTime(new Date('2026-06-24T15:00:00Z'))
    const d = new Date('2026-06-24T10:00:00Z') // 5h ago
    expect(relativeTime(d)).toBe('5h ago')
  })

  it('returns Xd ago for days', () => {
    vi.setSystemTime(new Date('2026-06-28T12:00:00Z'))
    const d = new Date('2026-06-24T12:00:00Z') // 4d ago
    expect(relativeTime(d)).toBe('4d ago')
  })
})

describe('dimBarColor', () => {
  it('returns bg-status-active for level >= 75', () => {
    expect(dimBarColor(75)).toBe('bg-status-active')
    expect(dimBarColor(100)).toBe('bg-status-active')
  })
  it('returns bg-status-warning for level 40-74', () => {
    expect(dimBarColor(40)).toBe('bg-status-warning')
    expect(dimBarColor(74)).toBe('bg-status-warning')
    expect(dimBarColor(50)).toBe('bg-status-warning')
  })
  it('returns bg-amber-600 for level < 40', () => {
    expect(dimBarColor(39)).toBe('bg-amber-600')
    expect(dimBarColor(0)).toBe('bg-amber-600')
  })
})

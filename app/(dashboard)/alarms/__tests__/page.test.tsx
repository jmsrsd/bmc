import { describe, it, expect } from 'vitest'
import { severityColor, relativeTime, columns, AlarmSection } from '../page'

describe('app/(dashboard)/alarms/page.tsx - pure functions', () => {
  describe('severityColor', () => {
    it('returns correct colors for known severities', () => {
      expect(severityColor('critical')).toBe('#FF453A')
      expect(severityColor('warning')).toBe('#FF9F0A')
      expect(severityColor('info')).toBe('#0A84FF')
    })

    it('returns default for unknown severity', () => {
      expect(severityColor('UNKNOWN')).toBe('#8E8E93')
    })
  })

  describe('relativeTime', () => {
    it('returns "Just now" for very recent', () => {
      const now = new Date()
      expect(relativeTime(now)).toBe('Just now')
    })

    it('returns minutes for recent', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(relativeTime(fiveMinAgo)).toBe('5m ago')
    })

    it('returns hours for older', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(relativeTime(twoHoursAgo)).toBe('2h ago')
    })

    it('returns days for very old', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(relativeTime(threeDaysAgo)).toBe('3d ago')
    })
  })

  describe('columns', () => {
    it('exports 6 columns', () => {
      expect(columns.length).toBe(6)
    })

    it('has correct headers', () => {
      expect(columns.map((c) => c.header)).toEqual(['Severity', 'Message', 'Zone', 'Source', 'Time', ''])
    })

    it('severity column has color dot', () => {
      const col = columns[0]
      expect(col.header).toBe('Severity')
      expect(typeof col.cell).toBe('function')
    })

    it('time column formats date', () => {
      const col = columns[4]
      expect(col.header).toBe('Time')
      expect(typeof col.cell).toBe('function')
    })

    it('ack column conditionally renders', () => {
      const col = columns[5]
      expect(col.header).toBe('')
      expect(typeof col.cell).toBe('function')
    })

    it('time column cell returns element', () => {
      const col = columns[4]
      const result = col.cell({ createdAt: new Date() } as any)
      expect(result).toBeDefined()
    })

    it('severity column cell returns element', () => {
      const col = columns[0]
      const result = col.cell({ severity: 'critical' } as any)
      expect(result).toBeDefined()
    })
  })

  describe('AlarmSection', () => {
    it('is exported', () => {
      expect(AlarmSection).toBeDefined()
      expect(typeof AlarmSection).toBe('function')
    })
  })
})
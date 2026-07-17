import { describe, it, expect, vi } from 'vitest'
import { calculateSummary } from '../_helpers'

describe('app/(dashboard)/energy/page.tsx - pure functions', () => {
  describe('calculateSummary', () => {
    it('returns zero summary for empty meters', () => {
      const result = calculateSummary([])
      expect(result).toEqual({
        totalKw: '0.0',
        totalCumulativeKwh: '0',
        meterCount: 0,
      })
    })

    it('calculates totals correctly', () => {
      const meters = [
        { id: 'm1', name: 'Meter 1', value: 10.5, cumulative: 1000, type: 'ELECTRIC', unit: 'kW' },
        { id: 'm2', name: 'Meter 2', value: 5.3, cumulative: 500, type: 'ELECTRIC', unit: 'kW' },
      ]
      const result = calculateSummary(meters)
      expect(result.totalKw).toBe('15.8')
      expect(result.totalCumulativeKwh).toBe('1,500')
      expect(result.meterCount).toBe(2)
    })

    it('handles single meter', () => {
      const meters = [{ id: 'm1', name: 'Meter 1', value: 42.1, cumulative: 9999.9, type: 'ELECTRIC', unit: 'kW' }]
      const result = calculateSummary(meters)
      expect(result.totalKw).toBe('42.1')
      expect(result.totalCumulativeKwh).toBe('10,000')
      expect(result.meterCount).toBe(1)
    })

    it('formats cumulative with locale', () => {
      const meters = [{ id: 'm1', name: 'Meter 1', value: 1, cumulative: 1234567.8, type: 'ELECTRIC', unit: 'kW' }]
      const result = calculateSummary(meters)
      expect(result.totalCumulativeKwh).toBe('1,234,568')
    })
  })
})
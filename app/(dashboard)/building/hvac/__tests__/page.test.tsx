import { describe, it, expect, vi } from 'vitest'
import { buildHvacRows } from '../page'

vi.mock('@/lib/zone-group', () => ({
  stripTowerPrefix: vi.fn((name: string) => name.replace(/^Tower\s*/i, '')),
}))

describe('app/(dashboard)/building/hvac/page.tsx - pure functions', () => {
  describe('buildHvacRows', () => {
    it('returns empty array for null building', () => {
      expect(buildHvacRows(null)).toEqual([])
    })

    it('returns empty array for undefined building', () => {
      expect(buildHvacRows(undefined)).toEqual([])
    })

    it('maps zones to rows with correct structure', () => {
      const building = {
        zones: [
          {
            id: 'z1',
            name: 'Tower A Level 1',
            floor: 1,
            hvacUnits: [{ setpoint: 22, state: 'ON', mode: 'AUTO', fanSpeed: 'LOW' }],
            sensors: [{ value: 21.5, type: 'TEMPERATURE' }],
          },
        ],
      }
      const rows = buildHvacRows(building)
      expect(rows.length).toBe(1)
      expect(rows[0]).toMatchObject({
        id: 'z1',
        zoneName: 'A Level 1',
        floor: 1,
        currentTemp: 21.5,
        setpoint: 22,
        state: 'ON',
        mode: 'AUTO',
        fanSpeed: 'LOW',
      })
    })

    it('uses defaults when hvac or sensors missing', () => {
      const building = {
        zones: [
          {
            id: 'z2',
            name: 'Zone 2',
            floor: -1,
            hvacUnits: [],
            sensors: [],
          },
        ],
      }
      const rows = buildHvacRows(building)
      expect(rows[0]).toMatchObject({
        zoneName: 'Zone 2',
        floor: -1,
        currentTemp: null,
        setpoint: 22,
        state: 'OFF',
        mode: 'AUTO',
        fanSpeed: 'AUTO',
      })
    })

    it('handles multiple zones', () => {
      const building = {
        zones: [
          { id: 'z1', name: 'Tower A 1', floor: 1, hvacUnits: [{ setpoint: 20 }], sensors: [{ value: 19 }] },
          { id: 'z2', name: 'Tower A 2', floor: 2, hvacUnits: [{ setpoint: 24 }], sensors: [{ value: 23 }] },
        ],
      }
      const rows = buildHvacRows(building)
      expect(rows.length).toBe(2)
      expect(rows[0].setpoint).toBe(20)
      expect(rows[1].setpoint).toBe(24)
    })

    it('handles zone with undefined hvacUnits/sensors', () => {
      const building = {
        zones: [
          { id: 'z1', name: 'Zone 1', floor: 1, hvacUnits: undefined, sensors: undefined },
        ],
      }
      const rows = buildHvacRows(building)
      expect(rows[0].currentTemp).toBeNull()
      expect(rows[0].setpoint).toBe(22)
      expect(rows[0].state).toBe('OFF')
      expect(rows[0].mode).toBe('AUTO')
      expect(rows[0].fanSpeed).toBe('AUTO')
    })

    it('handles zone with null hvacUnits/sensors', () => {
      const building = {
        zones: [
          { id: 'z1', name: 'Zone 1', floor: 1, hvacUnits: null, sensors: null },
        ],
      }
      const rows = buildHvacRows(building)
      expect(rows[0].currentTemp).toBeNull()
      expect(rows[0].setpoint).toBe(22)
      expect(rows[0].state).toBe('OFF')
      expect(rows[0].mode).toBe('AUTO')
      expect(rows[0].fanSpeed).toBe('AUTO')
    })
  })
})
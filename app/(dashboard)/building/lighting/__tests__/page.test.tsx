import { describe, it, expect, vi } from 'vitest'
import { buildLightingRows } from '../_helpers'

vi.mock('@/lib/zone-group', () => ({
  stripTowerPrefix: vi.fn((name: string) => name.replace(/^Tower\s*/i, '')),
}))

describe('app/(dashboard)/building/lighting/page.tsx - pure functions', () => {
  describe('buildLightingRows', () => {
    it('returns empty array for null building', () => {
      expect(buildLightingRows(null)).toEqual([])
    })

    it('returns empty array for undefined building', () => {
      expect(buildLightingRows(undefined)).toEqual([])
    })

    it('maps zones to rows with correct structure', () => {
      const building = {
        zones: [
          {
            id: 'z1',
            name: 'Tower A Level 1',
            floor: 1,
            lightZones: [{ state: 'ON', dimLevel: 80, scene: 'DAY' }],
          },
        ],
      }
      const rows = buildLightingRows(building)
      expect(rows.length).toBe(1)
      expect(rows[0]).toMatchObject({
        id: 'z1',
        zoneName: 'A Level 1',
        floor: 1,
        state: 'ON',
        dimLevel: 80,
        scene: 'DAY',
      })
    })

    it('uses defaults when light zone missing', () => {
      const building = {
        zones: [
          {
            id: 'z2',
            name: 'Zone 2',
            floor: -1,
            lightZones: [],
          },
        ],
      }
      const rows = buildLightingRows(building)
      expect(rows[0]).toMatchObject({
        zoneName: 'Zone 2',
        floor: -1,
        state: 'OFF',
        dimLevel: 0,
        scene: 'NORMAL',
      })
    })

    it('handles multiple zones', () => {
      const building = {
        zones: [
          { id: 'z1', name: 'Tower A 1', floor: 1, lightZones: [{ state: 'ON', dimLevel: 50 }] },
          { id: 'z2', name: 'Tower A 2', floor: 2, lightZones: [{ state: 'OFF', dimLevel: 0 }] },
        ],
      }
      const rows = buildLightingRows(building)
      expect(rows.length).toBe(2)
      expect(rows[0].dimLevel).toBe(50)
      expect(rows[1].dimLevel).toBe(0)
    })

    it('handles zone with undefined lightZones', () => {
      const building = {
        zones: [{ id: 'z1', name: 'Zone 1', floor: 1, lightZones: undefined }],
      }
      const rows = buildLightingRows(building)
      expect(rows[0].state).toBe('OFF')
      expect(rows[0].dimLevel).toBe(0)
      expect(rows[0].scene).toBe('NORMAL')
    })

    it('handles zone with null lightZones', () => {
      const building = {
        zones: [{ id: 'z1', name: 'Zone 1', floor: 1, lightZones: null }],
      }
      const rows = buildLightingRows(building)
      expect(rows[0].state).toBe('OFF')
      expect(rows[0].dimLevel).toBe(0)
      expect(rows[0].scene).toBe('NORMAL')
    })
  })
})
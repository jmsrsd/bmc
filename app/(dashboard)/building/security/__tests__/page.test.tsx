import { describe, it, expect } from 'vitest'
import { buildSecurityRows, STATUS_COLORS, STATUS_LABELS, type DoorRow } from '../_helpers'
import { columns } from '../_components'

describe('app/(dashboard)/building/security/page.tsx - pure functions', () => {
  describe('STATUS_COLORS', () => {
    it('has all statuses', () => {
      expect(STATUS_COLORS).toMatchObject({
        UNLOCKED: '#32D74B',
        LOCKED: '#FF9F0A',
        FORCED: '#FF453A',
      })
    })
  })

  describe('STATUS_LABELS', () => {
    it('has all labels', () => {
      expect(STATUS_LABELS).toMatchObject({
        UNLOCKED: 'Unlocked',
        LOCKED: 'Locked',
        FORCED: 'Forced',
      })
    })
  })

  describe('buildSecurityRows', () => {
    it('returns empty array for null building', () => {
      expect(buildSecurityRows(null)).toEqual([])
    })

    it('returns empty array for undefined building', () => {
      expect(buildSecurityRows(undefined)).toEqual([])
    })

    it('skips zones with no doors', () => {
      const building = {
        zones: [
          { name: 'Zone 1', doors: [] },
          { name: 'Zone 2', doors: [{ id: 'd1', name: 'Door 1', state: 'LOCKED' }] },
        ],
      }
      const rows = buildSecurityRows(building)
      expect(rows.length).toBe(1)
      expect(rows[0].doorName).toBe('Door 1')
    })

    it('flattens doors from zones', () => {
      const building = {
        zones: [
          {
            name: 'Zone 1',
            doors: [
              { id: 'd1', name: 'Door A', state: 'UNLOCKED' },
              { id: 'd2', name: 'Door B', state: 'LOCKED' },
            ],
          },
        ],
      }
      const rows = buildSecurityRows(building)
      expect(rows.length).toBe(2)
      expect(rows[0]).toMatchObject<Partial<DoorRow>>({
        doorName: 'Door A',
        zoneName: 'Zone 1',
        state: 'UNLOCKED',
        statusColor: '#32D74B',
        statusLabel: 'Unlocked',
      })
      expect(rows[1]).toMatchObject<Partial<DoorRow>>({
        doorName: 'Door B',
        state: 'LOCKED',
        statusColor: '#FF9F0A',
        statusLabel: 'Locked',
      })
    })
  })

  describe('columns', () => {
    it('exports 4 columns', () => {
      expect(columns.length).toBe(4)
    })

    it('has correct headers', () => {
      expect(columns.map((c) => c.header)).toEqual(['Zone', 'Door', 'Status', ''])
    })
  })
})

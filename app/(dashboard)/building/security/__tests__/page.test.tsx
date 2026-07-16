import { describe, it, expect } from 'vitest'
import { buildSecurityRows, STATUS_COLORS, STATUS_LABELS, columns, type DoorRow } from '../page.tsx'

describe('app/(dashboard)/building/security/page.tsx - pure functions', () => {
  describe('STATUS_COLORS', () => {
    it('has correct color mapping', () => {
      expect(STATUS_COLORS.UNLOCKED).toBe('#32D74B')
      expect(STATUS_COLORS.LOCKED).toBe('#FF9F0A')
      expect(STATUS_COLORS.FORCED).toBe('#FF453A')
    })
  })

  describe('STATUS_LABELS', () => {
    it('has correct label mapping', () => {
      expect(STATUS_LABELS.UNLOCKED).toBe('Unlocked')
      expect(STATUS_LABELS.LOCKED).toBe('Locked')
      expect(STATUS_LABELS.FORCED).toBe('Forced')
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

  describe('buildSecurityRows', () => {
    it('returns empty array for null building', () => {
      expect(buildSecurityRows(null)).toEqual([])
    })

    it('returns empty array for undefined building', () => {
      expect(buildSecurityRows(undefined)).toEqual([])
    })

    it('returns empty array for building with no doors', () => {
      const building = { zones: [{ id: 'z1', name: 'Zone 1', doors: [] }] }
      expect(buildSecurityRows(building)).toEqual([])
    })

    it('maps doors to rows with correct structure', () => {
      const building = {
        zones: [
          {
            id: 'z1',
            name: 'Lobby',
            doors: [
              { id: 'd1', name: 'Main Door', state: 'UNLOCKED' },
              { id: 'd2', name: 'Side Door', state: 'LOCKED' },
            ],
          },
        ],
      }
      const rows = buildSecurityRows(building)
      expect(rows.length).toBe(2)
      expect(rows[0]).toMatchObject<Partial<DoorRow>>({
        id: 'd1',
        doorName: 'Main Door',
        zoneName: 'Lobby',
        state: 'UNLOCKED',
        statusColor: '#32D74B',
        statusLabel: 'Unlocked',
      })
      expect(rows[1]).toMatchObject<Partial<DoorRow>>({
        id: 'd2',
        doorName: 'Side Door',
        zoneName: 'Lobby',
        state: 'LOCKED',
        statusColor: '#FF9F0A',
        statusLabel: 'Locked',
      })
    })

    it('handles unknown state with defaults', () => {
      const building = {
        zones: [
          {
            id: 'z1',
            name: 'Zone 1',
            doors: [{ id: 'd1', name: 'Door 1', state: 'UNKNOWN' }],
          },
        ],
      }
      const rows = buildSecurityRows(building)
      expect(rows[0].statusColor).toBe('#8E8E93')
      expect(rows[0].statusLabel).toBe('UNKNOWN')
    })

    it('handles multiple zones with doors', () => {
      const building = {
        zones: [
          { id: 'z1', name: 'Zone A', doors: [{ id: 'd1', name: 'Door A', state: 'LOCKED' }] },
          { id: 'z2', name: 'Zone B', doors: [{ id: 'd2', name: 'Door B', state: 'UNLOCKED' }] },
          { id: 'z3', name: 'Zone C', doors: [] }, // no doors
        ],
      }
      const rows = buildSecurityRows(building)
      expect(rows.length).toBe(2)
      expect(rows[0].zoneName).toBe('Zone A')
      expect(rows[1].zoneName).toBe('Zone B')
    })
  })
})
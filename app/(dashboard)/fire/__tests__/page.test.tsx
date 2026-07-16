import { describe, it, expect, vi } from 'vitest'
import { buildFireRows, PANEL_STATE_COLORS, DEVICE_STATE_COLORS, getPanelStatusColor, getDeviceStatusColor } from '../page'

describe('app/(dashboard)/fire/page.tsx - pure functions', () => {
  describe('PANEL_STATE_COLORS', () => {
    it('has correct color mapping', () => {
      expect(PANEL_STATE_COLORS.NORMAL).toBe('#32D74B')
      expect(PANEL_STATE_COLORS.ALARM).toBe('#FF453A')
      expect(PANEL_STATE_COLORS.FAULT).toBe('#FF9F0A')
      expect(PANEL_STATE_COLORS.DISCONNECTED).toBe('#8E8E93')
    })
  })

  describe('DEVICE_STATE_COLORS', () => {
    it('has correct color mapping', () => {
      expect(DEVICE_STATE_COLORS.NORMAL).toBe('#32D74B')
      expect(DEVICE_STATE_COLORS.ALARM).toBe('#FF453A')
      expect(DEVICE_STATE_COLORS.FAULT).toBe('#FF9F0A')
    })
  })

  describe('getPanelStatusColor', () => {
    it('returns correct color for known states', () => {
      expect(getPanelStatusColor('NORMAL')).toBe('#32D74B')
      expect(getPanelStatusColor('ALARM')).toBe('#FF453A')
      expect(getPanelStatusColor('FAULT')).toBe('#FF9F0A')
      expect(getPanelStatusColor('DISCONNECTED')).toBe('#8E8E93')
    })

    it('returns default gray for unknown state', () => {
      expect(getPanelStatusColor('UNKNOWN')).toBe('#8E8E93')
      expect(getPanelStatusColor('')).toBe('#8E8E93')
    })
  })

  describe('getDeviceStatusColor', () => {
    it('returns correct color for known states', () => {
      expect(getDeviceStatusColor('NORMAL')).toBe('#32D74B')
      expect(getDeviceStatusColor('ALARM')).toBe('#FF453A')
      expect(getDeviceStatusColor('FAULT')).toBe('#FF9F0A')
    })

    it('returns default gray for unknown state', () => {
      expect(getDeviceStatusColor('UNKNOWN')).toBe('#8E8E93')
    })
  })

  describe('buildFireRows', () => {
    it('returns empty array for null building', () => {
      expect(buildFireRows(null)).toEqual([])
    })

    it('returns empty array for undefined building', () => {
      expect(buildFireRows(undefined)).toEqual([])
    })

    it('returns empty array for building with no fire panels', () => {
      const building = { firePanels: [] }
      expect(buildFireRows(building)).toEqual([])
    })

    it('maps panels and devices correctly', () => {
      const building = {
        firePanels: [
          {
            id: 'p1',
            name: 'Panel 1',
            state: 'NORMAL',
            devices: [
              { id: 'd1', type: 'SMOKE', state: 'NORMAL', zone: 'Zone A' },
              { id: 'd2', type: 'HEAT', state: 'ALARM', zone: 'Zone B' },
            ],
          },
        ],
      }
      const rows = buildFireRows(building)
      expect(rows.length).toBe(1)
      expect(rows[0]).toMatchObject({
        id: 'p1',
        name: 'Panel 1',
        state: 'NORMAL',
        statusColor: '#32D74B',
        deviceCount: 2,
      })
      expect(rows[0].devices.length).toBe(2)
      expect(rows[0].devices[0]).toMatchObject({
        id: 'd1',
        type: 'SMOKE',
        state: 'NORMAL',
        zone: 'Zone A',
        statusColor: '#32D74B',
      })
      expect(rows[0].devices[1].statusColor).toBe('#FF453A')
    })

    it('handles multiple panels', () => {
      const building = {
        firePanels: [
          { id: 'p1', name: 'Panel 1', state: 'NORMAL', devices: [] },
          { id: 'p2', name: 'Panel 2', state: 'ALARM', devices: [{ id: 'd1', type: 'SMOKE', state: 'ALARM', zone: 'Z1' }] },
        ],
      }
      const rows = buildFireRows(building)
      expect(rows.length).toBe(2)
      expect(rows[0].state).toBe('NORMAL')
      expect(rows[1].state).toBe('ALARM')
    })

    it('handles unknown panel state with default color', () => {
      const building = {
        firePanels: [{ id: 'p1', name: 'Panel', state: 'UNKNOWN', devices: [] }],
      }
      const rows = buildFireRows(building)
      expect(rows[0].statusColor).toBe('#8E8E93')
    })

    it('handles panel with unknown device state', () => {
      const building = {
        firePanels: [{
          id: 'p1',
          name: 'Panel',
          state: 'NORMAL',
          devices: [{ id: 'd1', type: 'SMOKE', state: 'UNKNOWN', zone: 'Z1' }],
        }],
      }
      const rows = buildFireRows(building)
      expect(rows[0].devices[0].statusColor).toBe('#8E8E93')
    })

    it('handles panel without devices array', () => {
      const building = {
        firePanels: [{ id: 'p1', name: 'Panel', state: 'NORMAL', devices: undefined }],
      }
      const rows = buildFireRows(building)
      expect(rows[0].deviceCount).toBe(0)
    })
  })
})
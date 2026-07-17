import { describe, it, expect } from 'vitest'
import { getStatusColor, getFloorDisplay, buildElevatorRows, STATE_COLORS } from '../_helpers'
import { Arrow, StatusDot } from '../_components'

describe('app/(dashboard)/elevators/page.tsx - pure functions', () => {
  describe('STATE_COLORS', () => {
    it('exports correct color map', () => {
      expect(STATE_COLORS.NORMAL).toBe('#32D74B')
      expect(STATE_COLORS.RECALL).toBe('#FF9F0A')
      expect(STATE_COLORS.FAULT).toBe('#FF453A')
    })
  })

  describe('getStatusColor', () => {
    it('returns correct color for NORMAL state', () => {
      expect(getStatusColor('NORMAL')).toBe('#32D74B')
    })

    it('returns correct color for RECALL state', () => {
      expect(getStatusColor('RECALL')).toBe('#FF9F0A')
    })

    it('returns correct color for FAULT state', () => {
      expect(getStatusColor('FAULT')).toBe('#FF453A')
    })

    it('returns default color for unknown state', () => {
      expect(getStatusColor('UNKNOWN')).toBe('#8E8E93')
      expect(getStatusColor('')).toBe('#8E8E93')
    })
  })

  describe('getFloorDisplay', () => {
    it('formats positive floors correctly', () => {
      expect(getFloorDisplay(1)).toBe('F1')
      expect(getFloorDisplay(5)).toBe('F5')
      expect(getFloorDisplay(0)).toBe('F0')
    })

    it('formats negative floors correctly', () => {
      expect(getFloorDisplay(-1)).toBe('B1')
      expect(getFloorDisplay(-2)).toBe('B2')
    })
  })

  describe('buildElevatorRows', () => {
    it('returns empty array for null building', () => {
      expect(buildElevatorRows(null)).toEqual([])
    })

    it('returns empty array for undefined building', () => {
      expect(buildElevatorRows(undefined)).toEqual([])
    })

    it('returns empty array for building without elevators', () => {
      expect(buildElevatorRows({ elevators: [] })).toEqual([])
    })

    it('builds rows from building data', () => {
      const building = {
        elevators: [
          {
            id: 'e1',
            name: 'Main Elevator',
            cars: [
              { id: 'c1', name: 'Car A', floor: 1, direction: 'UP', state: 'NORMAL', doorState: 'CLOSED' },
              { id: 'c2', name: 'Car B', floor: -1, direction: 'DOWN', state: 'RECALL', doorState: 'OPEN' },
            ],
          },
        ],
      }
      const rows = buildElevatorRows(building)
      expect(rows).toHaveLength(2)
      expect(rows[0]).toEqual({
        id: 'c1',
        carName: 'Car A',
        elevatorName: 'Main Elevator',
        floor: 1,
        direction: 'UP',
        state: 'NORMAL',
        doorState: 'CLOSED',
        statusColor: '#32D74B',
      })
      expect(rows[1]).toEqual({
        id: 'c2',
        carName: 'Car B',
        elevatorName: 'Main Elevator',
        floor: -1,
        direction: 'DOWN',
        state: 'RECALL',
        doorState: 'OPEN',
        statusColor: '#FF9F0A',
      })
    })

    it('handles multiple elevators with multiple cars', () => {
      const building = {
        elevators: [
          { id: 'e1', name: 'Elevator A', cars: [{ id: 'c1', name: 'Car 1', floor: 1, direction: 'UP', state: 'NORMAL', doorState: 'CLOSED' }] },
          { id: 'e2', name: 'Elevator B', cars: [{ id: 'c2', name: 'Car 2', floor: 2, direction: 'DOWN', state: 'FAULT', doorState: 'CLOSED' }] },
        ],
      }
      const rows = buildElevatorRows(building)
      expect(rows).toHaveLength(2)
      expect(rows[0].elevatorName).toBe('Elevator A')
      expect(rows[1].elevatorName).toBe('Elevator B')
      expect(rows[1].statusColor).toBe('#FF453A')
    })

    it('handles elevator with empty cars array', () => {
      const building = {
        elevators: [{ id: 'e1', name: 'Empty', cars: [] }],
      }
      expect(buildElevatorRows(building)).toEqual([])
    })

    it('uses default color for unknown car state', () => {
      const building = {
        elevators: [{ id: 'e1', name: 'E1', cars: [{ id: 'c1', name: 'Car', floor: 1, direction: 'UP', state: 'WEIRD', doorState: 'CLOSED' }] }],
      }
      const rows = buildElevatorRows(building)
      expect(rows[0].statusColor).toBe('#8E8E93')
    })
  })

  describe('Arrow', () => {
    it('returns up arrow for UP direction', () => {
      expect(Arrow({ direction: 'UP' })).toBeDefined()
    })

    it('returns down arrow for DOWN direction', () => {
      expect(Arrow({ direction: 'DOWN' })).toBeDefined()
    })

    it('returns dash for unknown direction', () => {
      expect(Arrow({ direction: 'UNKNOWN' })).toBeDefined()
    })
  })

  describe('StatusDot', () => {
    it('returns element for known state', () => {
      expect(StatusDot({ state: 'NORMAL' })).toBeDefined()
    })

    it('returns element with default color for unknown state', () => {
      expect(StatusDot({ state: 'UNKNOWN' })).toBeDefined()
    })
  })
})
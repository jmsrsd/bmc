import { describe, it, expect, vi } from 'vitest'
import { buildZoneRows, calculateSummary } from '../_helpers'

vi.mock('@/lib/zone-group', () => ({
  stripTowerPrefix: vi.fn((name: string) => name.replace(/^[^—]+—\s*/, '')),
}))

describe('app/(dashboard)/building/page.tsx - pure functions', () => {
  it('exports buildZoneRows', () => {
    expect(buildZoneRows).toBeDefined()
    expect(typeof buildZoneRows).toBe('function')
  })

  it('builds zone rows from building data', () => {
    const building = {
      zones: [
        {
          id: 'z1',
          name: 'Tower 1 — 1F Premium Office',
          area: 1000,
          type: 'OFFICE',
          floor: 1,
          sensors: [
            { type: 'TEMPERATURE', value: 22.5, unit: '°C' },
            { type: 'HUMIDITY', value: 45, unit: '%' },
          ],
          hvacUnits: [{ state: 'ON', mode: 'COOL' }],
          lightZones: [{ state: 'ON', dimLevel: 80 }],
          doors: [
            { state: 'LOCKED' },
            { state: 'UNLOCKED' },
          ],
        },
        {
          id: 'z2',
          name: 'Tower 2 — 2F Lab',
          area: 500,
          type: 'LAB',
          floor: 2,
          sensors: [],
          hvacUnits: [],
          lightZones: [],
          doors: [],
        },
      ],
    }

    const rows = buildZoneRows(building)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      id: 'z1',
      zoneName: '1F Premium Office',
      area: 1000,
      zoneType: 'OFFICE',
      floor: 1,
      temp: '22.5°C',
      hvacState: 'ON',
      hvacMode: 'COOL',
      lightState: 'ON',
      dimLevel: 80,
      doors: '2 (1 open)',
    })
    expect(rows[1]).toEqual({
      id: 'z2',
      zoneName: '2F Lab',
      area: 500,
      zoneType: 'LAB',
      floor: 2,
      temp: '--',
      hvacState: 'OFF',
      hvacMode: 'AUTO',
      lightState: 'OFF',
      dimLevel: null,
      doors: '—',
    })
  })

  it('exports calculateSummary', () => {
    expect(calculateSummary).toBeDefined()
    expect(typeof calculateSummary).toBe('function')
  })

  it('calculates summary stats correctly', () => {
    const building = {
      zones: [
        { sensors: [{ id: 's1' }, { id: 's2' }] },
        { sensors: [{ id: 's3' }] },
      ],
      meters: [
        { value: 123.4 },
        { value: 56.7 },
      ],
    }
    const summary = calculateSummary(building, 5)
    expect(summary).toEqual({
      totalZones: 2,
      totalSensors: 3,
      openAlarms: 5,
      totalEnergy: '180.1',
    })
  })

  it('handles empty building', () => {
    const summary = calculateSummary({ zones: [], meters: [] }, 0)
    expect(summary).toEqual({
      totalZones: 0,
      totalSensors: 0,
      openAlarms: 0,
      totalEnergy: '0.0',
    })
  })

  it('handles single zone with no sensors', () => {
    const building = {
      zones: [{ sensors: [] }],
      meters: [{ value: 10 }],
    }
    const summary = calculateSummary(building, 1)
    expect(summary).toEqual({
      totalZones: 1,
      totalSensors: 0,
      openAlarms: 1,
      totalEnergy: '10.0',
    })
  })

  it('buildZoneRows handles empty sensors array', () => {
    const building = {
      zones: [
        {
          id: 'z1',
          name: 'Tower 1 — Empty Zone',
          area: 100,
          type: 'OFFICE',
          floor: 1,
          sensors: [],
          hvacUnits: [],
          lightZones: [],
          doors: [],
        },
      ],
    }
    const rows = buildZoneRows(building)
    expect(rows[0].temp).toBe('--')
    expect(rows[0].hvacState).toBe('OFF')
    expect(rows[0].hvacMode).toBe('AUTO')
    expect(rows[0].lightState).toBe('OFF')
    expect(rows[0].dimLevel).toBeNull()
    expect(rows[0].doors).toBe('—')
  })

  it('buildZoneRows handles missing hvac/light/doors', () => {
    const building = {
      zones: [
        {
          id: 'z1',
          name: 'Tower 1 — Zone',
          area: 100,
          type: 'OFFICE',
          floor: 1,
          sensors: [{ type: 'TEMPERATURE', value: 21, unit: '°C' }],
          hvacUnits: undefined,
          lightZones: null,
          doors: undefined,
        },
      ],
    }
    const rows = buildZoneRows(building)
    expect(rows[0].hvacState).toBe('OFF')
    expect(rows[0].hvacMode).toBe('AUTO')
    expect(rows[0].lightState).toBe('OFF')
    expect(rows[0].dimLevel).toBeNull()
    expect(rows[0].doors).toBe('—')
  })
})
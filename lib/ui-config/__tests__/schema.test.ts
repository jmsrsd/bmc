import { describe, it, expect } from 'vitest'
import {
  WidgetCapabilitySchema,
  WidgetConfigSchema,
  UiConfigResponseSchema,
} from '../schema'

// ─── WidgetCapabilitySchema ─────────────────────────────────────

describe('WidgetCapabilitySchema', () => {
  it('accepts all valid capabilities', () => {
    const valid = [
      'setpoint', 'fan-speed', 'hvac-mode', 'dim-level', 'on-off',
      'lock-unlock', 'scene-select', 'alarm-ack', 'recall', 'meter-read',
    ] as const
    for (const cap of valid) {
      expect(WidgetCapabilitySchema.parse(cap)).toBe(cap)
    }
  })

  it('rejects invalid capability', () => {
    expect(() => WidgetCapabilitySchema.parse('invalid')).toThrow()
    expect(() => WidgetCapabilitySchema.parse('')).toThrow()
    expect(() => WidgetCapabilitySchema.parse('view')).toThrow()
  })
})

// ─── WidgetConfigSchema ─────────────────────────────────────────

describe('WidgetConfigSchema', () => {
  const minimal = {
    id: 'hvac-z1',
    type: 'hvac-control',
    title: 'Zone 1 HVAC',
  }

  it('accepts minimal config', () => {
    const result = WidgetConfigSchema.parse(minimal)
    expect(result.id).toBe('hvac-z1')
    expect(result.type).toBe('hvac-control')
    expect(result.capabilities).toEqual([]) // default []
    expect(result.span).toBe(1) // default 1
  })

  it('accepts full config with all fields', () => {
    const full = {
      ...minimal,
      zoneId: 'z1',
      deviceId: 'hvac-1',
      deviceType: 'AHU',
      capabilities: ['setpoint', 'fan-speed', 'hvac-mode'],
      span: 2,
      minRole: 'operator',
      subscriptions: ['telemetry'],
      sensors: [
        { type: 'TEMPERATURE', label: 'Temp', unit: '°C' },
        { type: 'HUMIDITY', label: 'Humidity', unit: '%' },
      ],
    }
    const result = WidgetConfigSchema.parse(full)
    expect(result.capabilities).toHaveLength(3)
    expect(result.span).toBe(2)
    expect(result.minRole).toBe('operator')
    expect(result.sensors).toHaveLength(2)
    expect(result.sensors![0].type).toBe('TEMPERATURE')
  })

  it('accepts empty id (z.string() validates type, not length)', () => {
    expect(() => WidgetConfigSchema.parse({ ...minimal, id: '' })).not.toThrow()
  })

  it('rejects missing id', () => {
    const { id, ...noId } = minimal
    expect(() => WidgetConfigSchema.parse(noId)).toThrow()
  })

  it('rejects missing type', () => {
    const { type, ...noType } = minimal
    expect(() => WidgetConfigSchema.parse(noType)).toThrow()
  })

  it('rejects invalid span values', () => {
    expect(() => WidgetConfigSchema.parse({ ...minimal, span: 0 })).toThrow()
    expect(() => WidgetConfigSchema.parse({ ...minimal, span: 3 })).toThrow()
    expect(() => WidgetConfigSchema.parse({ ...minimal, span: '1' })).toThrow()
  })

  it('rejects invalid capability string', () => {
    expect(() =>
      WidgetConfigSchema.parse({ ...minimal, capabilities: ['setpoint', 'invalid'] })
    ).toThrow()
  })

  it('rejects invalid sensor type', () => {
    expect(() =>
      WidgetConfigSchema.parse({
        ...minimal,
        sensors: [{ type: 123, label: 'X', unit: 'Y' }],
      })
    ).toThrow()
  })
})

// ─── UiConfigResponseSchema ─────────────────────────────────────

describe('UiConfigResponseSchema', () => {
  const minimalResponse = {
    buildingId: 'b1',
    buildingName: 'Test Building',
    zones: [],
    global: [],
    navLinks: [],
  }

  it('accepts minimal response with defaults', () => {
    const result = UiConfigResponseSchema.parse(minimalResponse)
    expect(result.version).toBe(1) // defaults to SUPPORTED_SCHEMA_VERSION
    expect(result.buildingId).toBe('b1')
    expect(result.zones).toEqual([])
    expect(result.navLinks).toEqual([])
  })

  it('accepts explicit version', () => {
    const result = UiConfigResponseSchema.parse({ ...minimalResponse, version: 2 })
    expect(result.version).toBe(2)
  })

  it('rejects missing buildingId', () => {
    const { buildingId, ...noId } = minimalResponse
    expect(() => UiConfigResponseSchema.parse(noId)).toThrow()
  })

  it('rejects missing buildingName', () => {
    const { buildingName, ...noName } = minimalResponse
    expect(() => UiConfigResponseSchema.parse(noName)).toThrow()
  })

  it('accepts full response with zones and widgets', () => {
    const full = {
      ...minimalResponse,
      zones: [
        {
          id: 'z1',
          name: 'Lobby',
          floor: 1,
          type: 'LOBBY',
          widgets: [
            {
              id: 'hvac-z1',
              type: 'hvac-control',
              title: 'Lobby HVAC',
              capabilities: ['setpoint'],
              span: 2,
            },
          ],
        },
      ],
      global: [
        {
          id: 'alarms',
          type: 'alarm-list',
          title: 'Active Alarms',
          capabilities: ['alarm-ack'],
        },
      ],
      navLinks: [
        { label: 'Building', href: '/building', icon: 'Building2' },
        { label: 'HVAC', href: '/building/hvac', icon: 'Thermometer' },
      ],
    }
    const result = UiConfigResponseSchema.parse(full)
    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].widgets).toHaveLength(1)
    expect(result.global).toHaveLength(1)
    expect(result.navLinks).toHaveLength(2)
  })

  it('rejects invalid zone (missing name)', () => {
    expect(() =>
      UiConfigResponseSchema.parse({
        ...minimalResponse,
        zones: [{ id: 'z1', floor: 1, type: 'OFFICE', widgets: [] }],
      })
    ).toThrow()
  })

  it('rejects invalid version type', () => {
    expect(() =>
      UiConfigResponseSchema.parse({ ...minimalResponse, version: 'v1' })
    ).toThrow()
  })

  it('rejects negative version', () => {
    expect(() =>
      UiConfigResponseSchema.parse({ ...minimalResponse, version: -1 })
    ).toThrow()
  })
})

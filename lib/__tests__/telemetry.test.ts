import { describe, it, expect } from 'vitest'
import { validateTelemetry, TelemetrySchema } from '@/lib/telemetry'

describe('telemetry message schema', () => {
  const valid = {
    buildingId: 'b1',
    deviceId: 'ahu-01',
    type: 'analog-input' as const,
    value: 22.5,
    unit: '°C',
    ts: '2026-06-21T10:30:00Z',
    quality: 95,
  }

  it('accepts valid BACnet analog-input message', () => {
    expect(() => validateTelemetry(valid)).not.toThrow()
  })

  it('rejects missing buildingId', () => {
    const { buildingId, ...rest } = valid
    expect(() => validateTelemetry(rest)).toThrow()
  })

  it('rejects value out of range (NaN/Infinity)', () => {
    expect(() => validateTelemetry({ ...valid, value: NaN })).toThrow()
    expect(() => validateTelemetry({ ...valid, value: Infinity })).toThrow()
    expect(() => validateTelemetry({ ...valid, value: -Infinity })).toThrow()
  })

  it('rejects future timestamps', () => {
    expect(() =>
      validateTelemetry({ ...valid, ts: '2099-01-01T00:00:00Z' }),
    ).toThrow()
  })

  it('accepts quality 0-100', () => {
    expect(() =>
      validateTelemetry({ ...valid, quality: 0 }),
    ).not.toThrow()
    expect(() =>
      validateTelemetry({ ...valid, quality: 100 }),
    ).not.toThrow()
  })

  it('rejects quality below 0', () => {
    expect(() =>
      validateTelemetry({ ...valid, quality: -1 }),
    ).toThrow()
  })

  it('rejects quality above 100', () => {
    expect(() =>
      validateTelemetry({ ...valid, quality: 101 }),
    ).toThrow()
  })

  it('rejects invalid type enum', () => {
    expect(() =>
      validateTelemetry({ ...valid, type: 'invalid-type' }),
    ).toThrow()
  })

  it('accepts binary-input type', () => {
    expect(() =>
      validateTelemetry({ ...valid, type: 'binary-input' }),
    ).not.toThrow()
  })

  it('rejects empty buildingId', () => {
    expect(() =>
      validateTelemetry({ ...valid, buildingId: '' }),
    ).toThrow()
  })
})

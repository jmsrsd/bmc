import { describe, it, expect } from 'vitest'
import { celsiusToFahrenheit, validateSetpoint } from '@/lib/temperature'

describe('celsiusToFahrenheit', () => {
  it('converts 0°C to 32°F', () => { expect(celsiusToFahrenheit(0)).toBe(32) })
  it('converts 100°C to 212°F', () => { expect(celsiusToFahrenheit(100)).toBe(212) })
  it('rounds to 1 decimal place', () => { expect(celsiusToFahrenheit(22.5)).toBe(73) })
  it('converts negative temps', () => { expect(celsiusToFahrenheit(-10)).toBe(14) })
  it('converts body temp', () => { expect(celsiusToFahrenheit(37)).toBe(99) })
})

describe('validateSetpoint', () => {
  it('accepts 22°C', () => { expect(validateSetpoint(22)).toEqual({ valid: true }) })
  it('accepts min 16°C', () => { expect(validateSetpoint(16)).toEqual({ valid: true }) })
  it('accepts max 30°C', () => { expect(validateSetpoint(30)).toEqual({ valid: true }) })
  it('rejects 15°C', () => { expect(validateSetpoint(15)).toEqual({ valid: false, error: 'Below minimum 16°C' }) })
  it('rejects 31°C', () => { expect(validateSetpoint(31)).toEqual({ valid: false, error: 'Above maximum 30°C' }) })
  it('rejects NaN', () => { expect(validateSetpoint(NaN)).toEqual({ valid: false, error: 'Must be a number' }) })
})

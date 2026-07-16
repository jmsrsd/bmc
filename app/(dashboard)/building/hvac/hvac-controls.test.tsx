import { describe, it, expect } from 'vitest'
import { HvacControls } from './hvac-controls'

describe('hvac-controls.tsx - pure functions', () => {
  it('is exported', () => {
    expect(HvacControls).toBeDefined()
    expect(typeof HvacControls).toBe('function')
  })
})
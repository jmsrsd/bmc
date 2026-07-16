import { describe, it, expect } from 'vitest'
import { DoorLockButton } from './door-lock-button'

describe('door-lock-button.tsx - pure functions', () => {
  it('is exported', () => {
    expect(DoorLockButton).toBeDefined()
    expect(typeof DoorLockButton).toBe('function')
  })
})
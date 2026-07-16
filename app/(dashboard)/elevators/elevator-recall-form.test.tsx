import { describe, it, expect } from 'vitest'
import { ElevatorRecallForm } from './elevator-recall-form'

describe('elevator-recall-form.tsx - pure functions', () => {
  it('is exported', () => {
    expect(ElevatorRecallForm).toBeDefined()
    expect(typeof ElevatorRecallForm).toBe('function')
  })
})
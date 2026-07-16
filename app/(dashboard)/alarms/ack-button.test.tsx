import { describe, it, expect } from 'vitest'
import { AckButton } from './ack-button'

describe('ack-button.tsx - pure functions', () => {
  it('is exported', () => {
    expect(AckButton).toBeDefined()
    expect(typeof AckButton).toBe('function')
  })
})
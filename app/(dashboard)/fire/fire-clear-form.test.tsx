import { describe, it, expect } from 'vitest'
import { FireClearForm } from './fire-clear-form'

describe('fire-clear-form.tsx - pure functions', () => {
  it('is exported', () => {
    expect(FireClearForm).toBeDefined()
    expect(typeof FireClearForm).toBe('function')
  })
})
import { describe, it, expect } from 'vitest'
import { prisma } from '../prisma.ts'

describe('lib/prisma.ts - direct import', () => {
  it('re-exports prisma from mock-db', () => {
    expect(prisma).toBeDefined()
    expect(typeof prisma).toBe('object')
    expect(prisma).toHaveProperty('building')
    expect(prisma).toHaveProperty('zone')
    expect(prisma).toHaveProperty('hVACUnit')
    expect(prisma).toHaveProperty('lightZone')
    expect(prisma).toHaveProperty('door')
    expect(prisma).toHaveProperty('elevatorCar')
    expect(prisma).toHaveProperty('firePanel')
    expect(prisma).toHaveProperty('fireDevice')
    expect(prisma).toHaveProperty('alarm')
    expect(prisma).toHaveProperty('auditLog')
  })
})
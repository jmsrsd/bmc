import { describe, it, expect } from 'vitest'
import { prisma } from '../prisma.ts'

describe('lib/prisma.ts', () => {
  it('exports prisma from mock-db', () => {
    expect(prisma).toBeDefined()
    expect(typeof prisma).toBe('object')
  })

  it('has zone model', () => {
    expect(prisma.zone).toBeDefined()
    expect(typeof prisma.zone.findMany).toBe('function')
  })

  it('has sensor model', () => {
    expect(prisma.sensor).toBeDefined()
    expect(typeof prisma.sensor.findMany).toBe('function')
  })

  it('has HVACUnit model', () => {
    expect(prisma.hVACUnit).toBeDefined()
    expect(typeof prisma.hVACUnit.findMany).toBe('function')
  })

  it('has lightZone model', () => {
    expect(prisma.lightZone).toBeDefined()
    expect(typeof prisma.lightZone.findMany).toBe('function')
  })

  it('has door model', () => {
    expect(prisma.door).toBeDefined()
    expect(typeof prisma.door.findMany).toBe('function')
  })

  it('has alarm model', () => {
    expect(prisma.alarm).toBeDefined()
    expect(typeof prisma.alarm.findMany).toBe('function')
  })

  it('has elevator model', () => {
    expect(prisma.elevator).toBeDefined()
    expect(typeof prisma.elevator.findMany).toBe('function')
  })

  it('has firePanel model', () => {
    expect(prisma.firePanel).toBeDefined()
    expect(typeof prisma.firePanel.findMany).toBe('function')
  })

  it('has meter model', () => {
    expect(prisma.meter).toBeDefined()
    expect(typeof prisma.meter.findMany).toBe('function')
  })
})
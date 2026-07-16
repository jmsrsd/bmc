import { describe, it, expect, beforeEach, vi } from 'vitest'

let db: Record<string, any>

beforeEach(async () => {
  delete (globalThis as Record<string, any>).mockDb
  vi.resetModules()
  const mod = await import('@/lib/mock-db')
  db = mod.prisma
})

describe('findMany', () => {
  it('returns all items with no args', () => {
    expect(db.zone.findMany()).toHaveLength(15)
    expect(db.sensor.findMany()).toHaveLength(20)
    expect(db.door.findMany()).toHaveLength(12)
    expect(db.alarm.findMany()).toHaveLength(8)
  })
})

describe('match — direct value', () => {
  it('filters by direct equality', () => {
    const labs = db.zone.findMany({ where: { type: 'LAB' } })
    expect(labs).toHaveLength(2)
    expect(labs.every((z: any) => z.type === 'LAB')).toBe(true)
  })

  it('returns empty for no match', () => {
    expect(db.zone.findMany({ where: { type: 'NONEXISTENT' } })).toHaveLength(0)
  })
})

describe('match — operators', () => {
  it('equals', () => {
    expect(db.zone.findMany({ where: { floor: { equals: 1 } } })).toHaveLength(4) // z1,z7,z11,z14
  })

  it('not', () => {
    const notLobby = db.zone.findMany({ where: { type: { not: 'LOBBY' } } })
    expect(notLobby.every((z: any) => z.type !== 'LOBBY')).toBe(true)
  })

  it('in', () => {
    // OFFICE: z2,z3,z10 = 3. LAB: z4,z5 = 2. Total = 5
    const types = db.zone.findMany({ where: { type: { in: ['LAB', 'OFFICE'] } } })
    expect(types).toHaveLength(5)
    expect(types.every((z: any) => ['LAB', 'OFFICE'].includes(z.type))).toBe(true)
  })

  it('notIn', () => {
    const notOffice = db.zone.findMany({ where: { type: { notIn: ['OFFICE', 'LAB'] } } })
    expect(notOffice.every((z: any) => !['OFFICE', 'LAB'].includes(z.type))).toBe(true)
  })

  it('lt', () => {
    expect(db.zone.findMany({ where: { floor: { lt: 0 } } })).toHaveLength(2) // z6=-1, z8=-1
  })

  it('lte', () => {
    expect(db.zone.findMany({ where: { floor: { lte: 1 } } })).toHaveLength(6) // -1:x2, 1:x4
  })

  it('gt', () => {
    expect(db.zone.findMany({ where: { floor: { gt: 5 } } })).toHaveLength(1) // z13=10
  })

  it('gte', () => {
    expect(db.zone.findMany({ where: { floor: { gte: 5 } } })).toHaveLength(2) // z5=5, z13=10
  })

  it('contains', () => {
    expect(db.zone.findMany({ where: { name: { contains: 'Lab' } } })).toHaveLength(2) // z4 'Lab A', z5 'Lab B' — z9 is 'Cleanroom' not 'Lab'
  })

  it('startsWith', () => {
    expect(db.zone.findMany({ where: { name: { startsWith: 'Tower B' } } })).toHaveLength(2) // z10, z11
  })

  it('endsWith', () => {
    expect(db.zone.findMany({ where: { name: { endsWith: 'Lobby' } } })).toHaveLength(2) // z1, z11
  })
})

describe('match — compound logic', () => {
  it('AND', () => {
    const r = db.zone.findMany({ where: { AND: [{ type: 'OFFICE' }, { floor: { gte: 3 } }] } })
    expect(r).toHaveLength(1) // z3 (Office 2, floor 3) — z10 (Tower B Office, floor 2) is excluded
    expect(r[0].id).toBe('z3')
  })

  it('OR', () => {
    const r = db.zone.findMany({ where: { OR: [{ type: 'LOBBY' }, { type: 'LAB' }] } })
    expect(r).toHaveLength(4) // 2 LOBBY + 2 LAB
  })

  it('NOT', () => {
    const r = db.zone.findMany({ where: { NOT: { type: 'OFFICE' } } })
    expect(r.length).toBe(12) // 15 total - 3 OFFICE (z2,z3,z10)
  })
})

describe('findFirst', () => {
  it('returns first match', () => {
    const r = db.sensor.findFirst({ where: { type: 'PIR' } })
    expect(r?.type).toBe('PIR')
  })

  it('returns null for no match', () => {
    expect(db.sensor.findFirst({ where: { type: 'NONEXISTENT' } })).toBeNull()
  })

  it('supports select', () => {
    const r = db.sensor.findFirst({ where: { id: 's1' }, select: { id: true, value: true } })
    expect(r).toEqual({ id: 's1', value: 24.5 })
    expect((r as any).type).toBeUndefined()
  })
})

describe('findUnique', () => {
  it('finds by unique field', () => {
    const r = db.door.findUnique({ where: { id: 'd1' } })
    expect(r?.name).toBe('Main Entrance')
  })

  it('returns null for no match', () => {
    expect(db.door.findUnique({ where: { id: 'nonexistent' } })).toBeNull()
  })
})

describe('orderBy', () => {
  it('single field asc', () => {
    const sorted = db.zone.findMany({ orderBy: { floor: 'asc' } })
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].floor).toBeGreaterThanOrEqual(sorted[i - 1].floor)
    }
  })

  it('single field desc', () => {
    const sorted = db.zone.findMany({ orderBy: { floor: 'desc' } })
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].floor).toBeLessThanOrEqual(sorted[i - 1].floor)
    }
  })

  it('multiple fields', () => {
    const sorted = db.zone.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const typeCmp = prev.type.localeCompare(curr.type)
      expect(typeCmp === 0 ? prev.name.localeCompare(curr.name) <= 0 : typeCmp <= 0).toBe(true)
    }
  })
})

describe('include', () => {
  it('includes zones on building', () => {
    const b = db.building.findUnique({ include: { zones: true } })
    expect(b.zones).toHaveLength(15)
    expect(b.zones[0].buildingId).toBe('b1')
  })

  it('includes sensors on zone', () => {
    const zones = db.zone.findMany({ include: { sensors: true } })
    const z1 = zones.find((z: any) => z.id === 'z1')
    expect(z1.sensors).toHaveLength(1) // s1 only
    expect(z1.sensors[0].id).toBe('s1')
  })

  it('includes lightZones on zone', () => {
    const zones = db.zone.findMany({ include: { lightZones: true } })
    const z1 = zones.find((z: any) => z.id === 'z1')
    expect(z1.lightZones).toHaveLength(1)
    expect(z1.lightZones[0].id).toBe('l1')
  })

  it('includes hvacUnits on zone', () => {
    const zones = db.zone.findMany({ include: { hvacUnits: true } })
    const z1 = zones.find((z: any) => z.id === 'z1')
    expect(z1.hvacUnits).toHaveLength(1)
    expect(z1.hvacUnits[0].id).toBe('h1')
  })

  it('includes doors on zone', () => {
    const zones = db.zone.findMany({ include: { doors: true } })
    const z1 = zones.find((z: any) => z.id === 'z1')
    expect(z1.doors).toHaveLength(2) // d1 Main Entrance, d2 Lobby Emergency
    expect(z1.doors.map((d: any) => d.id)).toEqual(['d1', 'd2'])
  })

  it('includes elevators with nested cars', () => {
    const b = db.building.findUnique({ include: { elevators: { include: { cars: true } } } })
    expect(b.elevators).toHaveLength(3)
    const e1 = b.elevators.find((e: any) => e.id === 'e1')
    expect(e1.cars).toHaveLength(3)
    expect(e1.cars[0].elevatorId).toBe('e1')
  })

  it('includes firePanels with nested devices', () => {
    const b = db.building.findUnique({ include: { firePanels: { include: { devices: true } } } })
    expect(b.firePanels).toHaveLength(3)
    const fp1 = b.firePanels.find((f: any) => f.id === 'fp1')
    expect(fp1.devices).toHaveLength(4)
  })

  it('includes meters with readings', () => {
    const b = db.building.findUnique({ include: { meters: { include: { readings: true } } } })
    expect(b.meters).toHaveLength(5)
    const m1 = b.meters.find((m: any) => m.id === 'm1')
    expect(m1.readings.length).toBe(48)
    expect(m1.readings[0].meterId).toBe('m1')
  })

  it('includes cameras', () => {
    const b = db.building.findUnique({ include: { cameras: true } })
    expect(b.cameras).toHaveLength(3)
  })

  it('includes tenants', () => {
    const b = db.building.findUnique({ include: { tenants: true } })
    expect(b.tenants).toHaveLength(3)
  })

  it('includes alarms', () => {
    const b = db.building.findUnique({ include: { alarms: true } })
    expect(b.alarms).toHaveLength(8)
  })

  it('nested include: zones with lightZones on building', () => {
    const b = db.building.findUnique({ include: { zones: { include: { lightZones: true } } } })
    const lobbyZone = b.zones.find((z: any) => z.id === 'z1')
    expect(lobbyZone.lightZones).toHaveLength(1)
    expect(lobbyZone.lightZones[0].id).toBe('l1')
  })
})

describe('CRUD', () => {
  it('create adds item and returns it with generated id', () => {
    const log = db.auditLog.create({
      data: { action: 'TEST', userId: 'u1', timestamp: new Date() },
    })
    expect(log.id).toMatch(/^gen_/)
    expect(log.action).toBe('TEST')
  })

  it('building create updates singletons', () => {
    const updated = db.building.create({ data: { name: 'Updated Campus' } })
    expect(updated.name).toBe('Updated Campus')
    const [b] = db.building.findMany()
    expect(b.name).toBe('Updated Campus')
  })

  it('update modifies matching item and returns it', () => {
    const updated = db.door.update({ where: { id: 'd1' }, data: { state: 'LOCKED' } })
    expect(updated.state).toBe('LOCKED')
    // Verify persistence
    const check = db.door.findUnique({ where: { id: 'd1' } })
    expect(check.state).toBe('LOCKED')
  })

  it('update returns null for no match', () => {
    expect(db.door.update({ where: { id: 'nonexistent' }, data: { state: 'LOCKED' } })).toBeNull()
  })

  it('updateMany modifies matching items', () => {
    const result = db.sensor.updateMany({ where: { type: 'PIR' }, data: { quality: 50 } })
    expect(result.count).toBe(2)
    const pirs = db.sensor.findMany({ where: { type: 'PIR' } })
    expect(pirs.every((s: any) => s.quality === 50)).toBe(true)
  })

  it('count returns matching count', () => {
    expect(db.alarm.count()).toBe(8)
    expect(db.alarm.count({ where: { severity: 'critical' } })).toBe(2) // a1, a7
  })

  it('$transaction provides isolated store', async () => {
    const result = await db.$transaction(async (tx: any) => {
      return tx.zone.findMany({ where: { type: 'LAB' } })
    })
    expect(result).toHaveLength(2)
  })
})

describe('select', () => {
  it('limits returned fields via findFirst', () => {
    const zone = db.sensor.findFirst({ where: { id: 's1' }, select: { id: true, value: true } })
    expect(zone).toEqual({ id: 's1', value: 24.5 })
    expect((zone as any).type).toBeUndefined()
    expect((zone as any).zoneId).toBeUndefined()
  })
})

describe('edge cases', () => {
  it('empty where matches everything', () => {
    expect(db.zone.findMany({ where: {} })).toHaveLength(15)
  })

  it('skip and take', () => {
    const zones = db.zone.findMany({ skip: 5, take: 3 })
    expect(zones).toHaveLength(3)
    // With no orderBy, order is insertion order
    expect(zones[0].id).toBe('z6')
    expect(zones[2].id).toBe('z8')
  })
})

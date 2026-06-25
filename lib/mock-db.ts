// In-memory BMC data store — replaces Prisma/SQLite
// Supports the subset of Prisma query patterns used in this project

import * as data from './mock-data'

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj), (_key, val) =>
    val !== null && typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)
      ? new Date(val)
      : val
  )
}

type Filter = Record<string, any>
type OrderSpec = Record<string, 'asc' | 'desc'>
type IncludeSpec = Record<string, any>
type SelectSpec = Record<string, boolean>

function match(obj: Record<string, any>, where?: Filter): boolean {
  if (!where) return true
  for (const [key, val] of Object.entries(where)) {
    if (key === 'AND') {
      if (!(val as Filter[]).every((c) => match(obj, c))) return false
      continue
    }
    if (key === 'OR') {
      if (!(val as Filter[]).some((c) => match(obj, c))) return false
      continue
    }
    if (key === 'NOT') {
      if (match(obj, val as Filter)) return false
      continue
    }
    const valIsObj = val !== null && typeof val === 'object' && !Array.isArray(val)
    if (valIsObj) {
      for (const [op, operand] of Object.entries(val as Record<string, any>)) {
        switch (op) {
          case 'equals': if (obj[key] !== operand) return false; break
          case 'not': if (obj[key] === operand) return false; break
          case 'in': if (!(operand as any[]).includes(obj[key])) return false; break
          case 'notIn': if ((operand as any[]).includes(obj[key])) return false; break
          case 'lt': if (!(obj[key] < operand)) return false; break
          case 'lte': if (!(obj[key] <= operand)) return false; break
          case 'gt': if (!(obj[key] > operand)) return false; break
          case 'gte': if (!(obj[key] >= operand)) return false; break
          case 'contains': if (!String(obj[key] ?? '').includes(operand)) return false; break
          case 'startsWith': if (!String(obj[key] ?? '').startsWith(operand)) return false; break
          case 'endsWith': if (!String(obj[key] ?? '').endsWith(operand)) return false; break
          default: if (obj[key] !== val) return false
        }
      }
    } else {
      if (obj[key] !== val) return false
    }
  }
  return true
}

function applySelect(obj: Record<string, any>, select?: SelectSpec): Record<string, any> {
  if (!select) return obj
  const result: Record<string, any> = {}
  for (const key of Object.keys(select)) {
    if (key in obj) result[key] = obj[key]
  }
  return result
}

function orderItems(items: any[], orderBy?: OrderSpec | OrderSpec[]): any[] {
  if (!orderBy) return items
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy]
  return [...items].sort((a, b) => {
    for (const o of orders) {
      const [key, dir] = Object.entries(o)[0]
      const cmp = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0
      if (cmp !== 0) return dir === 'desc' ? -cmp : cmp
    }
    return 0
  })
}

// Extract child include spec from a Prisma-style relation spec
// Prisma: { include: { zones: { include: { lightZones: true }, where: {...} } } }
// -> spec = { include: { lightZones: true }, where: {...} }
// -> childInclude = spec.include (i.e. { lightZones: true })
function childInclude(spec: any): IncludeSpec | undefined {
  if (!spec || spec === true) return undefined
  return spec.include
}

// Build child items with filters/ordering from a Prisma-style relation spec
function buildChildItems(items: any[], spec: any): any[] {
  if (!spec || spec === true) return items
  let filtered = items
  if (spec.where) filtered = filtered.filter((i: any) => match(i, spec.where))
  if (spec.orderBy) filtered = orderItems(filtered, spec.orderBy)
  if (spec.skip) filtered = filtered.slice(spec.skip)
  if (spec.take) filtered = filtered.slice(0, spec.take)
  return filtered
}

// Relations map: model -> foreign key -> related model
function resolveInclude(
  row: Record<string, any>,
  include?: IncludeSpec,
  ctx?: any,
) {
  if (!include || !ctx) return row
  const r = { ...row }

  if (include.zones) {
    const spec = include.zones
    const items = buildChildItems(ctx.zones.filter((z: any) => z.buildingId === row.id), spec)
    r.zones = items.map((z: any) => resolveInclude(z, childInclude(spec), ctx))
  }
  if (include.sensors) {
    const spec = include.sensors
    r.sensors = buildChildItems(ctx.sensors.filter((s: any) => s.zoneId === row.id), spec)
  }
  if (include.hvacUnits) {
    const spec = include.hvacUnits
    r.hvacUnits = buildChildItems(ctx.hvacUnits.filter((h: any) => h.zoneId === row.id), spec)
  }
  if (include.lightZones) {
    const spec = include.lightZones
    r.lightZones = buildChildItems(ctx.lightZones.filter((l: any) => l.zoneId === row.id), spec)
  }
  if (include.doors) {
    r.doors = ctx.doors.filter((d: any) => d.zoneId === row.id)
  }
  if (include.cars) {
    r.cars = ctx.elevatorCars.filter((c: any) => c.elevatorId === row.id)
  }
  if (include.elevators) {
    const spec = include.elevators
    let items = ctx.elevators.filter((e: any) => e.buildingId === row.id)
    if (spec?.include) {
      items = items.map((e: any) => resolveInclude(e, spec.include, ctx))
    }
    r.elevators = items
  }
  if (include.firePanels) {
    const spec = include.firePanels
    let items = ctx.firePanels.filter((f: any) => f.buildingId === row.id)
    if (spec?.include) {
      items = items.map((f: any) => resolveInclude(f, spec.include, ctx))
    }
    r.firePanels = items
  }
  if (include.devices) {
    const spec = include.devices
    r.devices = buildChildItems(ctx.fireDevices.filter((d: any) => d.panelId === row.id), spec)
  }
  if (include.meters) {
    const spec = include.meters
    let items = ctx.meters.filter((m: any) => m.buildingId === row.id)
    if (spec?.include) {
      items = items.map((m: any) => resolveInclude(m, spec.include, ctx))
    }
    r.meters = items
  }
  if (include.readings) {
    const spec = include.readings
    r.readings = buildChildItems(ctx.meterReadings.filter((mr: any) => mr.meterId === row.id), spec)
  }
  if (include.cameras) {
    r.cameras = ctx.cameras.filter((c: any) => c.buildingId === row.id)
  }
  if (include.tenants) {
    r.tenants = ctx.tenants.filter((t: any) => t.buildingId === row.id)
  }
  if (include.alarms) {
    const spec = include.alarms
    r.alarms = buildChildItems(ctx.alarms.filter((a: any) => a.buildingId === row.id), spec)
  }
  return r
}

// ─── Store factory ──────────────────────────────────────────────
function createStore() {
  const zones = deepClone(data.ZONES)
  const hvacUnits = deepClone(data.HVAC_UNITS)
  const sensors = deepClone(data.SENSORS)
  const lightZones = deepClone(data.LIGHT_ZONES)
  const doors = deepClone(data.DOORS)
  const elevatorCars: any[] = []
  const elevators = deepClone(data.ELEVATORS).map((e: any) => {
    e.cars = e.cars.map((c: any) => {
      const cloned = deepClone(c)
      elevatorCars.push(cloned)
      return cloned
    })
    return e
  })
  const fireDevices: any[] = []
  const firePanels = deepClone(data.FIRE_PANELS).map((fp: any) => {
    fp.devices = fp.devices.map((d: any) => {
      const cloned = deepClone(d)
      fireDevices.push(cloned)
      return cloned
    })
    return fp
  })
  const meterReadings: any[] = []
  const meters = deepClone(data.METERS).map((m: any) => {
    m.readings = m.readings.map((r: any) => {
      const cloned = deepClone(r)
      meterReadings.push(cloned)
      return cloned
    })
    return m
  })
  const alarms = deepClone(data.ALARMS)
  const auditLogs: any[] = []
  const cameras = deepClone(data.CAMERAS)
  const tenants = deepClone(data.TENANTS)
  const building = deepClone(data.BUILDING)

  const ctx = { zones, hvacUnits, sensors, lightZones, doors, elevators, elevatorCars, firePanels, fireDevices, meters, meterReadings, cameras, tenants, alarms }

  function findFirst(items: any[], args: { where?: Filter; select?: SelectSpec }) {
    const item = items.find((i: any) => match(i, args.where))
    if (!item) return null
    if (args.select) return applySelect(item, args.select)
    return item
  }

  function findUnique(items: any[], args: { where: Filter; include?: IncludeSpec }) {
    const item = items.find((i: any) => match(i, args.where))
    if (!item) return null
    if (args.include) return resolveInclude(item, args.include, ctx)
    return item
  }

  function findMany(items: any[], args: any = {}) {
    let filtered = items.filter((i: any) => match(i, args.where))
    if (args.orderBy) filtered = orderItems(filtered, args.orderBy)
    if (args.skip) filtered = filtered.slice(args.skip)
    if (args.take) filtered = filtered.slice(0, args.take)
    if (args.include) return filtered.map((i: any) => resolveInclude(i, args.include!, ctx))
    return filtered
  }

  function count(items: any[], args: any = {}) {
    return items.filter((i: any) => match(i, args.where)).length
  }

  function updateMany(items: any[], args: { where: Filter; data: Record<string, any> }) {
    let count = 0
    for (const item of items) {
      if (match(item, args.where)) {
        Object.assign(item, args.data)
        count++
      }
    }
    return { count }
  }

  function update(items: any[], args: { where: Filter; data: Record<string, any> }) {
    const item = items.find((i: any) => match(i, args.where))
    if (!item) return null
    Object.assign(item, args.data)
    return item
  }

  function create(items: any[], args: { data: Record<string, any> }) {
    const item = deepClone(args.data)
    item.id = item.id || `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    items.push(item)
    return item
  }

  return {
    building: {
      findUnique: (args: any) => findUnique([building], { ...args, where: { id: building.id } }),
      findMany: () => [building],
      create: (args: any) => { Object.assign(building, args.data); return building },
    },
    zone: { findMany: (args?: any) => findMany(zones, args) },
    sensor: { findMany: (args?: any) => findMany(sensors, args), findFirst: (args: any) => findFirst(sensors, args), update: (args: any) => update(sensors, args), updateMany: (args: any) => updateMany(sensors, args) },
    hVACUnit: { findMany: (args?: any) => findMany(hvacUnits, args), findFirst: (args: any) => findFirst(hvacUnits, args), updateMany: (args: any) => updateMany(hvacUnits, args) },
    lightZone: { findMany: (args?: any) => findMany(lightZones, args), findFirst: (args: any) => findFirst(lightZones, args), updateMany: (args: any) => updateMany(lightZones, args) },
    door: { findMany: (args?: any) => findMany(doors, args), findUnique: (args: any) => findUnique(doors, args), update: (args: any) => update(doors, args) },
    elevator: { findMany: (args?: any) => findMany(elevators, args), findUnique: (args: any) => findUnique(elevators, args) },
    elevatorCar: { findMany: (args?: any) => findMany(elevatorCars, args), findUnique: (args: any) => findUnique(elevatorCars, args), update: (args: any) => update(elevatorCars, args) },
    firePanel: { findMany: (args?: any) => findMany(firePanels, args), findUnique: (args: any) => findUnique(firePanels, args), update: (args: any) => update(firePanels, args) },
    fireDevice: { findMany: (args?: any) => findMany(fireDevices, args), updateMany: (args: any) => updateMany(fireDevices, args) },
    meter: { findMany: (args?: any) => findMany(meters, args) },
    alarm: { findMany: (args?: any) => findMany(alarms, args), findUnique: (args: any) => findUnique(alarms, args), update: (args: any) => update(alarms, args), count: (args?: any) => count(alarms, args) },
    auditLog: { create: (args: any) => create(auditLogs, args) },
    $transaction: async (fn: (tx: any) => any) => fn(createStore()),
    $queryRaw: () => Promise.resolve([]),
  }
}

// Per-request singleton — same pattern as original lib/prisma.ts
const globalForMock = globalThis as unknown as { mockDb: ReturnType<typeof createStore> | undefined }

export const prisma = globalForMock.mockDb ?? createStore()
if (process.env.NODE_ENV !== 'production') globalForMock.mockDb = prisma

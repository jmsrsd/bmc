import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Prisma ──────────────────────────────────────────────

const mockPrisma = {
  zone: { findMany: vi.fn() },
  meter: { findMany: vi.fn() },
  alarm: { findMany: vi.fn() },
  elevator: { findMany: vi.fn() },
  camera: { findMany: vi.fn() },
  firePanel: { findMany: vi.fn() },
  building: { findUnique: vi.fn() },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// ─── Dynamic import helper ────────────────────────────────────

async function getService() {
  return await import('../service')
}

// ─── Factories ────────────────────────────────────────────────

function makeZone(overrides: Partial<any> = {}) {
  return {
    id: 'z1',
    buildingId: 'b1',
    name: 'Lobby',
    floor: 1,
    type: 'LOBBY',
    area: 100,
    hvacUnits: [],
    lightZones: [],
    doors: [],
    sensors: [],
    ...overrides,
  }
}

function makeHvac(overrides: Partial<any> = {}) {
  return { id: 'h1', zoneId: 'z1', type: 'AHU', setpoint: 22, mode: 'AUTO', fanSpeed: 'AUTO', state: 'ON', ...overrides }
}

function makeLight(overrides: Partial<any> = {}) {
  return { id: 'l1', zoneId: 'z1', name: 'Ceiling', dimLevel: 80, state: 'ON', ...overrides }
}

function makeDoor(overrides: Partial<any> = {}) {
  return { id: 'd1', zoneId: 'z1', name: 'Main Door', state: 'LOCKED', alarmState: 'NORMAL', ...overrides }
}

function makeSensor(overrides: Partial<any> = {}) {
  return { id: 's1', zoneId: 'z1', type: 'CO2', unit: 'ppm', value: 450, ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── buildUiConfig ─────────────────────────────────────────────

describe('buildUiConfig', () => {
  it('returns empty zones and no widgets for empty building', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.version).toBe(1)
    expect(result.buildingId).toBe('b1')
    expect(result.buildingName).toBe('Test Building')
    expect(result.zones).toEqual([])
    expect(result.global).toEqual([])
    expect(result.navLinks).toEqual([])
  })

  it('derives hvac-control widget when zone has HVAC units', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([
      makeZone({ hvacUnits: [makeHvac()] }),
    ])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].widgets).toHaveLength(1)
    const hvacWidget = result.zones[0].widgets[0]
    expect(hvacWidget.type).toBe('hvac-control')
    expect(hvacWidget.capabilities).toEqual(['setpoint', 'fan-speed', 'hvac-mode'])
    expect(hvacWidget.span).toBe(2)
    expect(hvacWidget.minRole).toBe('operator')
    expect(hvacWidget.subscriptions).toEqual(['telemetry'])
    expect(hvacWidget.zoneId).toBe('z1')
    expect(hvacWidget.deviceId).toBe('h1')
  })

  it('derives lighting-control widget when zone has light zones', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([
      makeZone({ lightZones: [makeLight()] }),
    ])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].widgets).toHaveLength(1)
    const lightWidget = result.zones[0].widgets[0]
    expect(lightWidget.type).toBe('lighting-control')
    expect(lightWidget.capabilities).toEqual(['on-off', 'dim-level'])
    expect(lightWidget.span).toBe(1)
    expect(lightWidget.minRole).toBe('operator')
  })

  it('derives door-status widget when zone has doors', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([
      makeZone({ doors: [makeDoor()] }),
    ])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].widgets).toHaveLength(1)
    const doorWidget = result.zones[0].widgets[0]
    expect(doorWidget.type).toBe('door-status')
    expect(doorWidget.capabilities).toEqual(['lock-unlock'])
    expect(doorWidget.span).toBe(1)
    expect(doorWidget.minRole).toBe('security')
  })

  it('derives sensor-readout widget for non-TEMP/HUMIDITY sensors', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([
      makeZone({
        sensors: [
          makeSensor({ type: 'CO2', unit: 'ppm' }),
          makeSensor({ id: 's2', type: 'VOC', unit: 'ppb' }),
        ],
      }),
    ])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].widgets).toHaveLength(1)
    const sensorWidget = result.zones[0].widgets[0]
    expect(sensorWidget.type).toBe('sensor-readout')
    expect(sensorWidget.sensors).toHaveLength(2)
    expect(sensorWidget.sensors![0]).toEqual({ type: 'CO2', label: 'CO2', unit: 'ppm' })
    expect(sensorWidget.sensors![1]).toEqual({ type: 'VOC', label: 'VOC', unit: 'ppb' })
  })

  it('derives multiple widgets when zone has HVAC + lights + doors + sensors', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([
      makeZone({
        hvacUnits: [makeHvac()],
        lightZones: [makeLight()],
        doors: [makeDoor()],
        sensors: [makeSensor({ type: 'CO2' })],
      }),
    ])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].widgets).toHaveLength(4)
    const types = result.zones[0].widgets.map((w) => w.type)
    expect(types).toContain('hvac-control')
    expect(types).toContain('lighting-control')
    expect(types).toContain('door-status')
    expect(types).toContain('sensor-readout')
  })

  it('includes alarm-list in global when open alarms exist', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([
      { id: 'a1', buildingId: 'b1', type: 'FIRE', severity: 'critical', status: 'open', zoneName: 'Lobby' },
    ])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.global).toHaveLength(1)
    expect(result.global[0].type).toBe('alarm-list')
    expect(result.global[0].capabilities).toEqual(['alarm-ack'])
  })

  it('includes nav links based on devices present', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([
      makeZone({
        hvacUnits: [makeHvac()],
        lightZones: [makeLight()],
        doors: [makeDoor()],
      }),
    ])
    mockPrisma.meter.findMany.mockResolvedValue([{ id: 'm1', type: 'ELECTRIC', name: 'Main', unit: 'kW' }])
    mockPrisma.alarm.findMany.mockResolvedValue([{ id: 'a1', buildingId: 'b1', type: 'FIRE', severity: 'critical', status: 'open', zoneName: 'Lobby' }])
    mockPrisma.elevator.findMany.mockResolvedValue([{ id: 'e1', buildingId: 'b1', name: 'Elevator 1', cars: [{ id: 'c1', name: 'Car A' }] }])
    mockPrisma.camera.findMany.mockResolvedValue([{ id: 'cam1', name: 'Front Door' }])
    mockPrisma.firePanel.findMany.mockResolvedValue([{ id: 'fp1', name: 'Panel 1', state: 'NORMAL' }])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    const labels = result.navLinks.map((l) => l.label)
    expect(labels).toContain('HVAC')
    expect(labels).toContain('Lighting')
    expect(labels).toContain('Security')
    expect(labels).toContain('Energy')
    expect(labels).toContain('Alarms')
    expect(labels).toContain('Elevators')
    expect(labels).toContain('Fire Safety')
    expect(labels).toContain('Cameras')
  })

  it('uses "Unknown Building" when building not found', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue(null)

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('nonexistent')

    expect(result.buildingName).toBe('Unknown Building')
  })

  it('skips sensor-readout for TEMPERATURE and HUMIDITY sensors', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([
      makeZone({
        sensors: [
          { id: 's1', zoneId: 'z1', type: 'TEMPERATURE', unit: '°C', value: 23 },
          { id: 's2', zoneId: 'z1', type: 'HUMIDITY', unit: '%', value: 55 },
        ],
      }),
    ])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { buildUiConfig } = await getService()
    const result = await buildUiConfig('b1')

    expect(result.zones[0].widgets).toHaveLength(0)
  })
})

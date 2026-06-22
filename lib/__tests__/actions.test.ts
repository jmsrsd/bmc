import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock modules before importing actions
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))

const mockPrisma = {
  hVACUnit: { findFirst: vi.fn(), updateMany: vi.fn() },
  lightZone: { findFirst: vi.fn(), updateMany: vi.fn() },
  door: { findUnique: vi.fn(), update: vi.fn() },
  elevatorCar: { findUnique: vi.fn(), update: vi.fn() },
  firePanel: { findUnique: vi.fn(), update: vi.fn() },
  fireDevice: { updateMany: vi.fn() },
  alarm: { findUnique: vi.fn(), update: vi.fn() },
  auditLog: { create: vi.fn() },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

let mockSession: any = { user: { id: 'test-user', role: 'admin', name: 'Test' } }
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => mockSession),
  checkAccess: vi.fn(),
}))

const BUILDING_ID = 'b1'

// Requires 'use server' — test by importing functions directly
// vi.mock handles module-level mocks; actions import works the same
async function getActions() {
  return await import('../actions')
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSession = { user: { id: 'test-user', role: 'admin', name: 'Test' } }
})

function fd(data: Record<string, string | number>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(data)) f.append(k, String(v))
  return f
}

// ─── HVAC Actions ──────────────────────────────────────────

describe('setTemperature', () => {
  it('rejects missing session', async () => {
    mockSession = null
    const { setTemperature } = await getActions()
    const res = await setTemperature(null, fd({ zoneId: 'z1', setpoint: 22 }))
    expect(res).toHaveProperty('error')
  })

  it('rejects setpoint below 16', async () => {
    const { setTemperature } = await getActions()
    const res = await setTemperature(null, fd({ zoneId: 'z1', setpoint: 10 }))
    expect(res).toHaveProperty('error')
  })

  it('rejects setpoint above 30', async () => {
    const { setTemperature } = await getActions()
    const res = await setTemperature(null, fd({ zoneId: 'z1', setpoint: 35 }))
    expect(res).toHaveProperty('error')
  })

  it('rejects missing zoneId', async () => {
    const { setTemperature } = await getActions()
    const res = await setTemperature(null, fd({ zoneId: '', setpoint: 22 }))
    expect(res).toHaveProperty('error')
  })

  it('succeeds with valid input', async () => {
    mockPrisma.hVACUnit.findFirst.mockResolvedValue({ setpoint: 22 })
    mockPrisma.hVACUnit.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { setTemperature } = await getActions()
    const res = await setTemperature(null, fd({ zoneId: 'z1', setpoint: 24 }))

    expect(res).toEqual({ success: true, setpoint: 24, zoneId: 'z1' })
    expect(mockPrisma.hVACUnit.findFirst).toHaveBeenCalledWith({ where: { zoneId: 'z1' }, select: { setpoint: true } })
    expect(mockPrisma.hVACUnit.updateMany).toHaveBeenCalledWith({ where: { zoneId: 'z1' }, data: { setpoint: 24 } })
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'test-user',
        action: 'SET_SETPOINT',
        target: 'z1',
        buildingId: 'b1',
      }),
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/building/hvac')
  })
})

describe('setFanSpeed', () => {
  it('rejects invalid speed', async () => {
    const { setFanSpeed } = await getActions()
    const res = await setFanSpeed(null, fd({ zoneId: 'z1', speed: 'INSANE' }))
    expect(res).toHaveProperty('error')
  })

  it('succeeds with AUTO', async () => {
    mockPrisma.hVACUnit.findFirst.mockResolvedValue({ fanSpeed: 'MEDIUM' })
    mockPrisma.hVACUnit.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { setFanSpeed } = await getActions()
    const res = await setFanSpeed(null, fd({ zoneId: 'z1', speed: 'AUTO' }))
    expect(res).toEqual({ success: true, speed: 'AUTO', zoneId: 'z1' })
  })
})

describe('setHvacMode', () => {
  it('rejects invalid mode', async () => {
    const { setHvacMode } = await getActions()
    const res = await setHvacMode(null, fd({ zoneId: 'z1', mode: 'BOOST' }))
    expect(res).toHaveProperty('error')
  })

  it('succeeds with HEAT', async () => {
    mockPrisma.hVACUnit.findFirst.mockResolvedValue({ mode: 'COOL' })
    mockPrisma.hVACUnit.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { setHvacMode } = await getActions()
    const res = await setHvacMode(null, fd({ zoneId: 'z1', mode: 'HEAT' }))
    expect(res).toEqual({ success: true, mode: 'HEAT', zoneId: 'z1' })
  })
})

// ─── Lighting Actions ──────────────────────────────────────

describe('setDimLevel', () => {
  it('rejects dim level over 100', async () => {
    const { setDimLevel } = await getActions()
    const res = await setDimLevel(null, fd({ zoneId: 'z1', level: 120 }))
    expect(res).toHaveProperty('error')
  })

  it('succeeds with 75%', async () => {
    mockPrisma.lightZone.findFirst.mockResolvedValue({ dimLevel: 50 })
    mockPrisma.lightZone.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { setDimLevel } = await getActions()
    const res = await setDimLevel(null, fd({ zoneId: 'z1', level: 75 }))
    expect(res).toEqual({ success: true, level: 75, zoneId: 'z1' })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/building/lighting')
  })
})

describe('toggleLight', () => {
  it('rejects invalid state', async () => {
    const { toggleLight } = await getActions()
    const res = await toggleLight(null, fd({ zoneId: 'z1', newState: 'FLASH' }))
    expect(res).toHaveProperty('error')
  })

  it('turns lights off', async () => {
    mockPrisma.lightZone.findFirst.mockResolvedValue({ state: 'ON' })
    mockPrisma.lightZone.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { toggleLight } = await getActions()
    const res = await toggleLight(null, fd({ zoneId: 'z1', newState: 'OFF' }))
    expect(res).toEqual({ success: true, state: 'OFF', zoneId: 'z1' })
  })
})

// ─── Security Actions ──────────────────────────────────────

describe('setDoorState', () => {
  it('rejects invalid door state', async () => {
    const { setDoorState } = await getActions()
    const res = await setDoorState(null, fd({ doorId: 'd1', newState: 'AJAR' }))
    expect(res).toHaveProperty('error')
  })

  it('locks a door', async () => {
    mockPrisma.door.findUnique.mockResolvedValue({ id: 'd1', state: 'UNLOCKED', name: 'Main Door' })
    mockPrisma.door.update.mockResolvedValue({})
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { setDoorState } = await getActions()
    const res = await setDoorState(null, fd({ doorId: 'd1', newState: 'LOCKED' }))
    expect(res).toEqual({ success: true, state: 'LOCKED', doorId: 'd1' })
    expect(mockPrisma.door.update).toHaveBeenCalledWith({
      where: { id: 'd1' },
      data: { state: 'LOCKED' },
    })
  })
})

// ─── Elevator Actions ──────────────────────────────────────

describe('recallElevator', () => {
  it('rejects out of range floor', async () => {
    const { recallElevator } = await getActions()
    const res = await recallElevator(null, fd({ carId: 'c1', targetFloor: 99 }))
    expect(res).toHaveProperty('error')
  })

  it('recalls elevator car', async () => {
    mockPrisma.elevatorCar.findUnique.mockResolvedValue({ id: 'c1', name: 'Car A', floor: 5, direction: 'IDLE', doorState: 'OPEN' })
    mockPrisma.elevatorCar.update.mockResolvedValue({})
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { recallElevator } = await getActions()
    const res = await recallElevator(null, fd({ carId: 'c1', targetFloor: 1 }))
    expect(res).toEqual({ success: true, carId: 'c1', targetFloor: 1 })
  })
})

describe('clearElevatorRecall', () => {
  it('requires carId', async () => {
    const { clearElevatorRecall } = await getActions()
    const res = await clearElevatorRecall(null, fd({ carId: '' }))
    expect(res).toHaveProperty('error')
  })

  it('clears recall', async () => {
    mockPrisma.elevatorCar.findUnique.mockResolvedValue({ id: 'c1', name: 'Car A' })
    mockPrisma.elevatorCar.update.mockResolvedValue({})
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { clearElevatorRecall } = await getActions()
    const res = await clearElevatorRecall(null, fd({ carId: 'c1' }))
    expect(res).toEqual({ success: true, carId: 'c1' })
    expect(mockPrisma.elevatorCar.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { recallFloor: 0, direction: 'IDLE', doorState: 'CLOSED' },
    })
  })
})

// ─── Fire Safety Actions ───────────────────────────────────

describe('clearFireAlarm', () => {
  it('requires panelId', async () => {
    const { clearFireAlarm } = await getActions()
    const res = await clearFireAlarm(null, fd({ panelId: '' }))
    expect(res).toHaveProperty('error')
  })

  it('clears fire alarm and devices', async () => {
    mockPrisma.firePanel.findUnique.mockResolvedValue({ id: 'p1', name: 'Panel 1', state: 'ALARM' })
    mockPrisma.firePanel.update.mockResolvedValue({})
    mockPrisma.fireDevice.updateMany.mockResolvedValue({})
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { clearFireAlarm } = await getActions()
    const res = await clearFireAlarm(null, fd({ panelId: 'p1' }))
    expect(res).toEqual({ success: true, panelId: 'p1' })
    expect(mockPrisma.firePanel.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { state: 'NORMAL' },
    })
    expect(mockPrisma.fireDevice.updateMany).toHaveBeenCalledWith({
      where: { panelId: 'p1' },
      data: { state: 'NORMAL' },
    })
  })
})

// ─── Alarm Actions ─────────────────────────────────────────

describe('acknowledgeAlarm', () => {
  it('requires alarmId', async () => {
    const { acknowledgeAlarm } = await getActions()
    const res = await acknowledgeAlarm(null, fd({ alarmId: '' }))
    expect(res).toHaveProperty('error')
  })

  it('rejects already-acknowledged alarm', async () => {
    mockPrisma.alarm.findUnique.mockResolvedValue({ id: 'a1', status: 'acknowledged' })
    const { acknowledgeAlarm } = await getActions()
    const res = await acknowledgeAlarm(null, fd({ alarmId: 'a1' }))
    expect(res).toEqual({ error: 'Alarm not found or already acknowledged' })
  })

  it('acknowledges open alarm', async () => {
    const now = new Date()
    mockPrisma.alarm.findUnique.mockResolvedValue({ id: 'a1', status: 'open', type: 'FIRE', severity: 'critical' })
    mockPrisma.alarm.update.mockResolvedValue({})
    mockPrisma.auditLog.create.mockResolvedValue({})

    const { acknowledgeAlarm } = await getActions()
    const res = await acknowledgeAlarm(null, fd({ alarmId: 'a1' }))
    expect(res).toEqual({ success: true, alarmId: 'a1' })
    expect(mockPrisma.alarm.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: expect.objectContaining({
        status: 'acknowledged',
        acknowledgedBy: 'test-user',
      }),
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
  })
})

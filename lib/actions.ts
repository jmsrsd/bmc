'use server'

// Server Actions — BMC control surface
// DESIGN.md §3.4 pattern: Zod + Auth + Prisma + Audit + revalidate
// USECASE.md: UC-HVAC-01, UC-HVAC-02, UC-HVAC-03, UC-LGT-01, UC-LGT-02, UC-SEC-01, UC-ALM-02

import { prisma } from '@/lib/mock-db'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getSession, checkAccess } from '@/lib/auth'
import { BUILDING_ID } from '@/lib/types'

// ─── HVAC Actions ────────────────────────────────────────────

export async function setTemperature(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const zoneId = formData.get('zoneId') as string
    const setpoint = Number(formData.get('setpoint'))

    if (!zoneId || isNaN(setpoint) || setpoint < 16 || setpoint > 30) {
      return { error: 'Invalid input: setpoint must be 16-30°C' }
    }

    // Read current value for audit
    const current: any = await prisma.hVACUnit.findFirst({ where: { zoneId }, select: { setpoint: true } })

    await prisma.hVACUnit.updateMany({
      where: { zoneId },
      data: { setpoint },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'SET_SETPOINT',
        target: zoneId,
        detail: JSON.stringify({ before: current?.setpoint ?? null, after: setpoint }),
        buildingId: BUILDING_ID,
      },
    })

    // Invalidate all building-related caches
    revalidateTag('building')
    revalidatePath(`/building/hvac`)
    return { success: true, setpoint, zoneId }
  } catch (e: any) {
    return { error: e.message || 'Failed to set temperature' }
  }
}

export async function setFanSpeed(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const zoneId = formData.get('zoneId') as string
    const speed = formData.get('speed') as string
    const validSpeeds = ['OFF', 'LOW', 'MEDIUM', 'HIGH', 'AUTO']

    if (!zoneId || !validSpeeds.includes(speed)) {
      return { error: 'Invalid fan speed' }
    }

    const current: any = await prisma.hVACUnit.findFirst({ where: { zoneId }, select: { fanSpeed: true } })

    await prisma.hVACUnit.updateMany({
      where: { zoneId },
      data: { fanSpeed: speed },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'SET_FAN_SPEED',
        target: zoneId,
        detail: JSON.stringify({ before: current?.fanSpeed, after: speed }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/building/hvac`)
    return { success: true, speed, zoneId }
  } catch (e: any) {
    return { error: e.message || 'Failed to set fan speed' }
  }
}

export async function setHvacMode(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const zoneId = formData.get('zoneId') as string
    const mode = formData.get('mode') as string
    const validModes = ['COOL', 'HEAT', 'AUTO', 'VENT']

    if (!zoneId || !validModes.includes(mode)) {
      return { error: 'Invalid HVAC mode' }
    }

    const current: any = await prisma.hVACUnit.findFirst({ where: { zoneId }, select: { mode: true } })

    await prisma.hVACUnit.updateMany({
      where: { zoneId },
      data: { mode },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'SET_HVAC_MODE',
        target: zoneId,
        detail: JSON.stringify({ before: current?.mode, after: mode }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/building/hvac`)
    return { success: true, mode, zoneId }
  } catch (e: any) {
    return { error: e.message || 'Failed to set HVAC mode' }
  }
}

// ─── Lighting Actions ──────────────────────────────────────────

export async function setDimLevel(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const zoneId = formData.get('zoneId') as string
    const level = Number(formData.get('level'))

    if (!zoneId || isNaN(level) || level < 0 || level > 100) {
      return { error: 'Invalid dim level (0-100)' }
    }

    const current: any = await prisma.lightZone.findFirst({ where: { zoneId }, select: { dimLevel: true } })

    await prisma.lightZone.updateMany({
      where: { zoneId },
      data: { dimLevel: level },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'SET_DIM_LEVEL',
        target: zoneId,
        detail: JSON.stringify({ before: current?.dimLevel, after: level }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/building/lighting`)
    return { success: true, level, zoneId }
  } catch (e: any) {
    return { error: e.message || 'Failed to set dim level' }
  }
}

export async function toggleLight(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const zoneId = formData.get('zoneId') as string
    const newState = formData.get('newState') as string

    if (!zoneId || !['ON', 'OFF'].includes(newState)) {
      return { error: 'Invalid light state' }
    }

    const current: any = await prisma.lightZone.findFirst({ where: { zoneId }, select: { state: true } })

    await prisma.lightZone.updateMany({
      where: { zoneId },
      data: { state: newState },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: newState === 'ON' ? 'LIGHT_ON' : 'LIGHT_OFF',
        target: zoneId,
        detail: JSON.stringify({ before: current?.state, after: newState }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/building/lighting`)
    return { success: true, state: newState, zoneId }
  } catch (e: any) {
    return { error: e.message || 'Failed to toggle light' }
  }
}

// ─── Security Actions ──────────────────────────────────────────

export async function setDoorState(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'security')

    const doorId = formData.get('doorId') as string
    const newState = formData.get('newState') as string

    if (!doorId || !['LOCKED', 'UNLOCKED'].includes(newState)) {
      return { error: 'Invalid door state' }
    }

    const current: any = await prisma.door.findUnique({ where: { id: doorId }, select: { state: true, name: true } })
    if (!current) return { error: 'Door not found' }

    await prisma.door.update({
      where: { id: doorId },
      data: { state: newState },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: newState === 'LOCKED' ? 'DOOR_LOCK' : 'DOOR_UNLOCK',
        target: doorId,
        detail: JSON.stringify({ doorName: current.name, before: current.state, after: newState }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/building/security`)
    return { success: true, state: newState, doorId }
  } catch (e: any) {
    return { error: e.message || 'Failed to set door state' }
  }
}

// ─── Elevator Actions ───────────────────────────────────────────

export async function recallElevator(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'security')

    const carId = formData.get('carId') as string
    const targetFloor = Number(formData.get('targetFloor'))

    if (!carId || isNaN(targetFloor) || targetFloor < -2 || targetFloor > 50) {
      return { error: 'Invalid recall target' }
    }

    const car: any = await prisma.elevatorCar.findUnique({ where: { id: carId } })
    if (!car) return { error: 'Elevator car not found' }

    await prisma.elevatorCar.update({
      where: { id: carId },
      data: { recallFloor: targetFloor, direction: targetFloor > car.floor ? 'UP' : 'DOWN', doorState: 'CLOSED' },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'ELEVATOR_RECALL',
        target: carId,
        detail: JSON.stringify({ carName: car.name, fromFloor: car.floor, toFloor: targetFloor }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/elevators`)
    return { success: true, carId, targetFloor }
  } catch (e: any) {
    return { error: e.message || 'Failed to recall elevator' }
  }
}

export async function clearElevatorRecall(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'security')

    const carId = formData.get('carId') as string
    if (!carId) return { error: 'Missing car ID' }

    const car: any = await prisma.elevatorCar.findUnique({ where: { id: carId } })
    if (!car) return { error: 'Elevator car not found' }

    await prisma.elevatorCar.update({
      where: { id: carId },
      data: { recallFloor: 0, direction: 'IDLE', doorState: 'CLOSED' },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'ELEVATOR_CLEAR_RECALL',
        target: carId,
        detail: JSON.stringify({ carName: car.name }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/elevators`)
    return { success: true, carId }
  } catch (e: any) {
    return { error: e.message || 'Failed to clear recall' }
  }
}

// ─── Fire Safety Actions ────────────────────────────────────────

export async function clearFireAlarm(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'security')

    const panelId = formData.get('panelId') as string
    const comment = (formData.get('comment') as string) || ''

    if (!panelId) return { error: 'Missing panel ID' }

    const panel: any = await prisma.firePanel.findUnique({ where: { id: panelId } })
    if (!panel) return { error: 'Panel not found' }

    await prisma.firePanel.update({
      where: { id: panelId },
      data: { state: 'NORMAL' },
    })

    // Also clear all devices under this panel
    await prisma.fireDevice.updateMany({
      where: { panelId },
      data: { state: 'NORMAL' },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'FIRE_ALARM_CLEAR',
        target: panelId,
        detail: JSON.stringify({ panelName: panel.name, fromState: panel.state, toState: 'NORMAL', comment }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/fire`)
    return { success: true, panelId }
  } catch (e: any) {
    return { error: e.message || 'Failed to clear fire alarm' }
  }
}

// ─── Alarm Actions ──────────────────────────────────────────────

export async function acknowledgeAlarm(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const alarmId = formData.get('alarmId') as string
    const comment = (formData.get('comment') as string) || ''

    if (!alarmId) return { error: 'Missing alarm ID' }

    const alarm: any = await prisma.alarm.findUnique({ where: { id: alarmId } })
    if (!alarm || alarm.status !== 'open') {
      return { error: 'Alarm not found or already acknowledged' }
    }

    await prisma.alarm.update({
      where: { id: alarmId },
      data: {
        status: 'acknowledged',
        acknowledgedBy: session!.user.id,
        acknowledgedAt: new Date(),
        comment,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'ALARM_ACK',
        target: alarmId,
        detail: JSON.stringify({ alarmType: alarm.type, severity: alarm.severity, comment }),
        buildingId: BUILDING_ID,
      },
    })

    revalidateTag('building')
    revalidatePath(`/`)
    return { success: true, alarmId }
  } catch (e: any) {
    return { error: e.message || 'Failed to acknowledge alarm' }
  }
}

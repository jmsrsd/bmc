'use server'

// Server Actions — BMC control surface
// DESIGN.md §3.4 pattern: Zod + Auth + Prisma + Audit + revalidate
// USECASE.md: UC-HVAC-01, UC-HVAC-02, UC-HVAC-03, UC-LGT-01, UC-LGT-02, UC-SEC-01, UC-ALM-02

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession, checkAccess } from '@/lib/auth'
import { BUILDING_ID } from '@/lib/types'
import {
  SetTemperatureSchema,
  SetFanSpeedSchema,
  SetHvacModeSchema,
  SetDimLevelSchema,
  ToggleLightSchema,
  SetDoorStateSchema,
  RecallElevatorSchema,
  ClearElevatorRecallSchema,
  ClearFireAlarmSchema,
  AcknowledgeAlarmSchema,
} from '@/lib/schemas'

// Helper: FormData.get() returns null for missing fields — strip nulls for Zod
function formDataToObject(fd: FormData): Record<string, string | number> {
  const obj: Record<string, string> = {}
  fd.forEach((val, key) => {
    obj[key] = val
  })
  return obj
}

// ─── HVAC Actions ────────────────────────────────────────────

export async function setTemperature(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const parsed = SetTemperatureSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { zoneId, setpoint } = parsed.data

    const current = await prisma.hVACUnit.findFirst({ where: { zoneId }, select: { setpoint: true } })

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

    const parsed = SetFanSpeedSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { zoneId, speed } = parsed.data

    const current = await prisma.hVACUnit.findFirst({ where: { zoneId }, select: { fanSpeed: true } })

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

    const parsed = SetHvacModeSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { zoneId, mode } = parsed.data

    const current = await prisma.hVACUnit.findFirst({ where: { zoneId }, select: { mode: true } })

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

    const parsed = SetDimLevelSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { zoneId, level } = parsed.data

    const current = await prisma.lightZone.findFirst({ where: { zoneId }, select: { dimLevel: true } })

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

    const parsed = ToggleLightSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { zoneId, newState } = parsed.data

    const current = await prisma.lightZone.findFirst({ where: { zoneId }, select: { state: true } })

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

    const parsed = SetDoorStateSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { doorId, newState } = parsed.data

    const current = await prisma.door.findUnique({ where: { id: doorId }, select: { state: true, name: true } })
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

    revalidatePath(`/building/security`)
    return { success: true, state: newState, doorId }
  } catch (e: any) {
    return { error: e.message || 'Failed to set door state' }
  }
}

// ─── Elevator Actions ─────────────────────────────────────────

export async function recallElevator(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'security')

    const parsed = RecallElevatorSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { carId, targetFloor } = parsed.data

    const car = await prisma.elevatorCar.findUnique({ where: { id: carId } })
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

    const parsed = ClearElevatorRecallSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { carId } = parsed.data

    const car = await prisma.elevatorCar.findUnique({ where: { id: carId } })
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

    revalidatePath(`/elevators`)
    return { success: true, carId }
  } catch (e: any) {
    return { error: e.message || 'Failed to clear recall' }
  }
}

// ─── Fire Safety Actions ──────────────────────────────────────

export async function clearFireAlarm(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'security')

    const parsed = ClearFireAlarmSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { panelId, comment } = parsed.data

    const panel = await prisma.firePanel.findUnique({ where: { id: panelId } })
    if (!panel) return { error: 'Panel not found' }

    await prisma.firePanel.update({
      where: { id: panelId },
      data: { state: 'NORMAL' },
    })

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

    revalidatePath(`/fire`)
    return { success: true, panelId }
  } catch (e: any) {
    return { error: e.message || 'Failed to clear fire alarm' }
  }
}

// ─── Alarm Actions ────────────────────────────────────────────

export async function acknowledgeAlarm(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    const parsed = AcknowledgeAlarmSchema.safeParse(formDataToObject(formData))
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }
    const { alarmId, comment } = parsed.data

    const alarm = await prisma.alarm.findUnique({ where: { id: alarmId } })
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

    revalidatePath(`/`)
    return { success: true, alarmId }
  } catch (e: any) {
    return { error: e.message || 'Failed to acknowledge alarm' }
  }
}

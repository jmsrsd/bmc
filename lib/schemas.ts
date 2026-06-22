import { z } from 'zod'

// ─── HVAC Schemas ────────────────────────────────────────────

export const SetTemperatureSchema = z.object({
  zoneId: z.string().min(1, 'Zone ID required'),
  setpoint: z.coerce.number().min(16, 'Below minimum 16°C').max(30, 'Above maximum 30°C'),
})

export const SetFanSpeedSchema = z.object({
  zoneId: z.string().min(1, 'Zone ID required'),
  speed: z.enum(['OFF', 'LOW', 'MEDIUM', 'HIGH', 'AUTO']),
})

export const SetHvacModeSchema = z.object({
  zoneId: z.string().min(1, 'Zone ID required'),
  mode: z.enum(['COOL', 'HEAT', 'AUTO', 'VENT']),
})

// ─── Lighting Schemas ──────────────────────────────────────────

export const SetDimLevelSchema = z.object({
  zoneId: z.string().min(1, 'Zone ID required'),
  level: z.coerce.number().min(0, 'Min 0').max(100, 'Max 100'),
})

export const ToggleLightSchema = z.object({
  zoneId: z.string().min(1, 'Zone ID required'),
  newState: z.enum(['ON', 'OFF']),
})

// ─── Security Schemas ──────────────────────────────────────────

export const SetDoorStateSchema = z.object({
  doorId: z.string().min(1, 'Door ID required'),
  newState: z.enum(['LOCKED', 'UNLOCKED']),
})

// ─── Elevator Schemas ─────────────────────────────────────────

export const RecallElevatorSchema = z.object({
  carId: z.string().min(1, 'Car ID required'),
  targetFloor: z.coerce.number().min(-2, 'Min floor -2').max(50, 'Max floor 50'),
})

export const ClearElevatorRecallSchema = z.object({
  carId: z.string().min(1, 'Car ID required'),
})

// ─── Fire Safety Schemas ──────────────────────────────────────

export const ClearFireAlarmSchema = z.object({
  panelId: z.string().min(1, 'Panel ID required'),
  comment: z.string().optional().default(''),
})

// ─── Alarm Schemas ────────────────────────────────────────────

export const AcknowledgeAlarmSchema = z.object({
  alarmId: z.string().min(1, 'Alarm ID required'),
  comment: z.string().optional().default(''),
})

// ─── Type Exports ─────────────────────────────────────────────

export type SetTemperatureInput = z.infer<typeof SetTemperatureSchema>
export type SetFanSpeedInput = z.infer<typeof SetFanSpeedSchema>
export type SetHvacModeInput = z.infer<typeof SetHvacModeSchema>
export type SetDimLevelInput = z.infer<typeof SetDimLevelSchema>
export type ToggleLightInput = z.infer<typeof ToggleLightSchema>
export type SetDoorStateInput = z.infer<typeof SetDoorStateSchema>
export type RecallElevatorInput = z.infer<typeof RecallElevatorSchema>
export type ClearElevatorRecallInput = z.infer<typeof ClearElevatorRecallSchema>
export type ClearFireAlarmInput = z.infer<typeof ClearFireAlarmSchema>
export type AcknowledgeAlarmInput = z.infer<typeof AcknowledgeAlarmSchema>

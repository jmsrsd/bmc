import { z } from 'zod'
import { SUPPORTED_SCHEMA_VERSION } from './types'

// ─── Capabilities ───────────────────────────────────────────────

export const WidgetCapabilitySchema = z.enum([
  'setpoint',
  'fan-speed',
  'hvac-mode',
  'dim-level',
  'on-off',
  'lock-unlock',
  'scene-select',
  'alarm-ack',
  'recall',
  'meter-read',
])

// ─── Sensor Metadata ────────────────────────────────────────────

export const SensorMetaSchema = z.object({
  type: z.string(),
  label: z.string(),
  unit: z.string(),
})

// ─── Widget Config ───────────────────────────────────────────────

export const WidgetConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  zoneId: z.string().optional(),
  deviceId: z.string().optional(),
  deviceType: z.string().optional(),
  capabilities: z.array(WidgetCapabilitySchema).default([]),
  span: z.union([z.literal(1), z.literal(2)]).default(1),
  minRole: z.string().optional(),
  subscriptions: z.array(z.string()).optional(),
  sensors: z.array(SensorMetaSchema).optional(),
})

// ─── Zone Config ─────────────────────────────────────────────────

export const ZoneConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  floor: z.number(),
  type: z.string(),
  widgets: z.array(WidgetConfigSchema),
})

// ─── Nav Link ────────────────────────────────────────────────────

export const NavLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string(),
})

// ─── UI Config Response ─────────────────────────────────────────

export const UiConfigResponseSchema = z.object({
  version: z.number().int().positive().default(SUPPORTED_SCHEMA_VERSION),
  buildingId: z.string(),
  buildingName: z.string(),
  zones: z.array(ZoneConfigSchema),
  global: z.array(WidgetConfigSchema),
  navLinks: z.array(NavLinkSchema),
})

// ─── Inferred types ──────────────────────────────────────────────

export type WidgetCapabilityT = z.infer<typeof WidgetCapabilitySchema>
export type WidgetConfigT = z.infer<typeof WidgetConfigSchema>
export type UiConfigResponseT = z.infer<typeof UiConfigResponseSchema>

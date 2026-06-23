// Backend-driven UI config types
// DESIGN.md §3.2 — dynamic dashboard layout from server

import type { ZoneType, Role } from '@/lib/types'

/** SDUI schema version — bump on breaking changes */
export const SUPPORTED_SCHEMA_VERSION = 1

/** Controls that a device supports (SDUI reference props pattern) */
export type WidgetCapability =
  | 'setpoint'       // temperature setpoint adjustment
  | 'fan-speed'      // OFF/LOW/MED/HIGH/AUTO
  | 'hvac-mode'      // COOL/HEAT/AUTO/VENT
  | 'dim-level'      // 0-100% dimming
  | 'on-off'         // toggle on/off
  | 'lock-unlock'    // door lock/unlock
  | 'scene-select'   // lighting scene
  | 'alarm-ack'      // acknowledge alarm
  | 'recall'         // elevator recall
  | 'meter-read'     // meter reading display

/** A single widget descriptor — props carry references, not data */
export interface WidgetConfig {
  id: string
  /** Resolved against component registry */
  type: string
  title: string
  /** Reference IDs — components fetch own data */
  zoneId?: string
  deviceId?: string
  deviceType?: string
  /** Drives which controls the widget shows */
  capabilities: WidgetCapability[]
  /** Grid span hint */
  span?: 1 | 2
  /** Role gate */
  minRole?: Role
  /** SSE event types to subscribe to */
  subscriptions?: string[]
  /** Sensor metadata for display */
  sensors?: { type: string; label: string; unit: string }[]
}

/** Full versioned UI config response */
export interface UiConfigResponse {
  version: number
  buildingId: string
  buildingName: string
  /** Widgets grouped by zone for layout */
  zones: {
    id: string
    name: string
    floor: number
    type: ZoneType
    widgets: WidgetConfig[]
  }[]
  /** Standalone widgets (alarms, global meters) */
  global: WidgetConfig[]
  /** Navigation links derived from zone devices */
  navLinks: { label: string; href: string; icon: string }[]
}

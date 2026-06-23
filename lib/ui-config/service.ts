import { prisma } from '@/lib/prisma'
import { SUPPORTED_SCHEMA_VERSION } from './types'
import type { UiConfigResponse, WidgetConfig } from './types'
import type { Zone, HVACUnit, LightZone, Door, Sensor, Meter, Alarm, FirePanel, Camera, Elevator } from '@prisma/client'

// ─── Internal helpers ─────────────────────────────────────────

type ZoneWithDevices = Zone & {
  hvacUnits: HVACUnit[]
  lightZones: LightZone[]
  doors: Door[]
  sensors: Sensor[]
}

type ElevatorWithCars = Elevator & {
  cars: { id: string; name: string }[]
}

function deriveZoneWidgets(zone: ZoneWithDevices): WidgetConfig[] {
  const widgets: WidgetConfig[] = []

  // HVAC control widget
  if (zone.hvacUnits.length > 0) {
    widgets.push({
      id: `hvac-${zone.id}`,
      type: 'hvac-control',
      title: `${zone.name} HVAC`,
      zoneId: zone.id,
      deviceId: zone.hvacUnits[0].id,
      deviceType: zone.hvacUnits[0].type,
      capabilities: ['setpoint', 'fan-speed', 'hvac-mode'],
      span: 2,
      minRole: 'operator',
      subscriptions: ['telemetry'],
    })
  }

  // Lighting control widget
  if (zone.lightZones.length > 0) {
    widgets.push({
      id: `lighting-${zone.id}`,
      type: 'lighting-control',
      title: `${zone.name} Lighting`,
      zoneId: zone.id,
      deviceId: zone.lightZones[0].id,
      deviceType: 'LIGHT',
      capabilities: ['on-off', 'dim-level'],
      span: 1,
      minRole: 'operator',
    })
  }

  // Door status widget
  if (zone.doors.length > 0) {
    widgets.push({
      id: `door-${zone.id}`,
      type: 'door-status',
      title: `${zone.name} Doors`,
      zoneId: zone.id,
      deviceId: zone.doors[0].id,
      deviceType: 'DOOR',
      capabilities: ['lock-unlock'],
      span: 1,
      minRole: 'security',
    })
  }

  // Sensor readout widget (non-TEMP / non-HUMIDITY sensors)
  const specialSensors = zone.sensors.filter(
    (s) => s.type !== 'TEMPERATURE' && s.type !== 'HUMIDITY'
  )
  if (specialSensors.length > 0) {
    widgets.push({
      id: `sensors-${zone.id}`,
      type: 'sensor-readout',
      title: `${zone.name} Sensors`,
      zoneId: zone.id,
      deviceType: 'SENSOR',
      capabilities: [],
      span: 1,
      sensors: specialSensors.map((s) => ({
        type: s.type,
        label: s.type,
        unit: s.unit,
      })),
    })
  }

  return widgets
}

function deriveGlobalWidgets(
  alarms: Alarm[],
  meters: Meter[],
  firePanels: FirePanel[],
  cameras: Camera[],
): WidgetConfig[] {
  const global: WidgetConfig[] = []

  if (alarms.length > 0) {
    global.push({
      id: 'alarm-list',
      type: 'alarm-list',
      title: 'Active Alarms',
      capabilities: ['alarm-ack'],
      span: 2,
      minRole: 'operator',
    })
  }

  if (meters.length > 0) {
    global.push({
      id: 'meter-gauge',
      type: 'meter-gauge',
      title: 'Energy Meters',
      capabilities: ['meter-read'],
      span: 1,
    })
  }

  if (firePanels.length > 0) {
    global.push({
      id: 'fire-panel',
      type: 'fire-panel',
      title: 'Fire Safety',
      capabilities: [],
      span: 2,
      minRole: 'operator',
    })
  }

  if (cameras.length > 0) {
    global.push({
      id: 'camera-grid',
      type: 'camera-grid',
      title: 'Cameras',
      capabilities: [],
      span: 2,
    })
  }

  return global
}

function deriveNavLinks(
  zones: ZoneWithDevices[],
  meters: Meter[],
  alarms: Alarm[],
  elevators: ElevatorWithCars[],
  firePanels: FirePanel[],
  cameras: Camera[],
): { label: string; href: string; icon: string }[] {
  const links: { label: string; href: string; icon: string }[] = []

  const hasHvac = zones.some((z) => z.hvacUnits.length > 0)
  const hasLights = zones.some((z) => z.lightZones.length > 0)
  const hasDoors = zones.some((z) => z.doors.length > 0)

  if (hasHvac) links.push({ label: 'HVAC', href: '/building/hvac', icon: 'Thermometer' })
  if (hasLights) links.push({ label: 'Lighting', href: '/building/lighting', icon: 'Lightbulb' })
  if (hasDoors) links.push({ label: 'Security', href: '/building/security', icon: 'Shield' })
  if (meters.length > 0) links.push({ label: 'Energy', href: '/building/energy', icon: 'Zap' })
  if (alarms.length > 0) links.push({ label: 'Alarms', href: '/building/alarms', icon: 'Bell' })
  if (elevators.length > 0) links.push({ label: 'Elevators', href: '/building/elevators', icon: 'ArrowUp' })
  if (firePanels.length > 0) links.push({ label: 'Fire Safety', href: '/building/fire-safety', icon: 'Flame' })
  if (cameras.length > 0) links.push({ label: 'Cameras', href: '/building/cameras', icon: 'Camera' })

  return links
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Build a full UiConfigResponse for a given building.
 * Queries all device tables in parallel and derives widgets + nav links.
 */
export async function buildUiConfig(buildingId: string): Promise<UiConfigResponse> {
  const [
    zones,
    meters,
    alarms,
    elevators,
    cameras,
    firePanels,
    building,
  ] = await Promise.all([
    prisma.zone.findMany({
      where: { buildingId },
      include: { hvacUnits: true, lightZones: true, doors: true, sensors: true },
      orderBy: { floor: 'asc' },
    }),
    prisma.meter.findMany({ where: { buildingId } }),
    prisma.alarm.findMany({ where: { buildingId, status: 'open' }, orderBy: { createdAt: 'desc' } }),
    prisma.elevator.findMany({ where: { buildingId }, include: { cars: true } }),
    prisma.camera.findMany({ where: { buildingId } }),
    prisma.firePanel.findMany({ where: { buildingId } }),
    prisma.building.findUnique({
      where: { id: buildingId },
      select: { name: true },
    }),
  ])

  const buildingName = building?.name ?? 'Unknown Building'

  const zoneConfigs = zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    floor: zone.floor,
    type: zone.type,
    widgets: deriveZoneWidgets(zone),
  }))

  const globalWidgets = deriveGlobalWidgets(alarms, meters, firePanels, cameras)
  const navLinks = deriveNavLinks(zones, meters, alarms, elevators, firePanels, cameras)

  return {
    version: SUPPORTED_SCHEMA_VERSION,
    buildingId,
    buildingName,
    zones: zoneConfigs,
    global: globalWidgets,
    navLinks,
  }
}

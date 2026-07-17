import { stripTowerPrefix } from '@/lib/zone-group'

export type ZoneRow = {
  id: string
  zoneName: string
  area: number | null
  zoneType: string
  floor: number
  temp: string
  hvacState: string
  hvacMode: string
  lightState: string
  dimLevel: number | null
  doors: string
}

export function buildZoneRows(building: any): ZoneRow[] {
  return building.zones.map((zone: any) => {
    const tempSensor = zone.sensors.find((s: any) => s.type === 'TEMPERATURE')
    const hvacUnits = zone.hvacUnits ?? []
    const lightZones = zone.lightZones ?? []
    const doors = zone.doors ?? []
    const hvac = hvacUnits[0]
    const light = lightZones[0]
    const doorCount = doors.length
    const unlockedCount = doors.filter((d: any) => d.state === 'UNLOCKED').length

    return {
      id: zone.id,
      zoneName: stripTowerPrefix(zone.name),
      area: zone.area,
      zoneType: zone.type,
      floor: zone.floor,
      temp: tempSensor ? `${tempSensor.value.toFixed(1)}${tempSensor.unit}` : '--',
      hvacState: hvac?.state ?? 'OFF',
      hvacMode: hvac?.mode ?? 'AUTO',
      lightState: light?.state ?? 'OFF',
      dimLevel: light?.dimLevel ?? null,
      doors: doorCount > 0 ? `${doorCount} (${unlockedCount} open)` : '—',
    }
  })
}

export function calculateSummary(building: any, openAlarms: number) {
  const totalZones = building.zones.length
  const totalSensors = building.zones.reduce((a: number, z: any) => a + z.sensors.length, 0)
  const totalEnergy = building.meters.reduce((a: number, m: any) => a + m.value, 0).toFixed(1)
  return { totalZones, totalSensors, openAlarms, totalEnergy }
}

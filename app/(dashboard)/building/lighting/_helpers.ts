import { stripTowerPrefix } from '@/lib/zone-group'

export function buildLightingRows(building: any): any[] {
  if (!building) return []
  return building.zones.map((zone: any) => {
    const lightZones = zone.lightZones ?? []
    const light = lightZones[0]
    return {
      id: zone.id,
      zoneName: stripTowerPrefix(zone.name),
      floor: zone.floor,
      state: light?.state ?? 'OFF',
      dimLevel: light?.dimLevel ?? 0,
      scene: light?.scene ?? 'NORMAL',
    }
  })
}

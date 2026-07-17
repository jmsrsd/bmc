import { stripTowerPrefix } from '@/lib/zone-group'

export function buildHvacRows(building: any): any[] {
  if (!building) return []
  return building.zones.map((zone: any) => {
    const hvacUnits = zone.hvacUnits ?? []
    const sensors = zone.sensors ?? []
    const hvac = hvacUnits[0]
    const tempSensor = sensors[0]
    return {
      id: zone.id,
      zoneName: stripTowerPrefix(zone.name),
      floor: zone.floor,
      currentTemp: tempSensor?.value ?? null,
      setpoint: hvac?.setpoint ?? 22,
      state: hvac?.state ?? 'OFF',
      mode: hvac?.mode ?? 'AUTO',
      fanSpeed: hvac?.fanSpeed ?? 'AUTO',
    }
  })
}

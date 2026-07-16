import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { HvacControls } from './hvac-controls'
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

export default async function HvacPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          hvacUnits: true,
          sensors: {
            where: { type: 'TEMPERATURE' },
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-secondary text-[14px]">Building not found</p>
      </div>
    )
  }

  const rows = buildHvacRows(building)
  // ... rest unchanged

  const columns: Column<any>[] = [
    { header: 'Zone', cell: (z) => <span className="text-[14px] font-medium text-white">{z.zoneName}</span> },
    { header: 'Floor', cell: (z) => <span className="text-[12px] text-secondary">{z.floor >= 0 ? `F${z.floor}` : `B${Math.abs(z.floor)}`}</span> },
    { header: 'Temp', cell: (z) => (
      <span className="text-[14px] font-['JetBrains_Mono'] text-white">
        {z.currentTemp !== null ? `${z.currentTemp.toFixed(1)}°C` : '--°C'}
      </span>
    )},
    { header: 'Setpoint', cell: (z) => <span className="text-[12px] text-secondary">{z.setpoint}°C</span> },
    { header: 'State', cell: (z) => {
      const on = z.state === 'ON'
      return <span className={`text-[12px] ${on ? 'text-normal' : 'text-secondary'}`}>{z.state}</span>
    }},
    { header: 'Controls', cell: (z) => (
      <HvacControls
        zoneId={z.id}
        initialSetpoint={z.setpoint}
        currentTemp={z.currentTemp}
        currentSpeed={z.fanSpeed}
        currentMode={z.mode}
      />
    )},
  ]

  return (
    <div>
      <PageHeader title="HVAC Control" subtitle="Zone temperature, fan speed & mode" />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(z) => z.id}
          emptyMessage="No zones found"
        />
      </div>
    </div>
  )
}
import { prisma } from '@/lib/prisma'
import { stripTowerPrefix } from '@/lib/zone-group'
import { DataTable, type Column } from '@/components/ui/data-table'

export const dynamic = 'force-dynamic'

async function getBuildingData() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          sensors: true,
          hvacUnits: true,
          lightZones: true,
          doors: true,
        },
        orderBy: { floor: 'asc' },
      },
      elevators: { include: { cars: true } },
      firePanels: { include: { devices: true } },
      meters: {
        include: {
          readings: { orderBy: { timestamp: 'desc' }, take: 48 },
        },
      },
    },
  })

  const openAlarms = await prisma.alarm.count({
    where: { buildingId: 'b1', status: 'open' },
  })

  return { building, openAlarms }
}

type ZoneRow = {
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

export default async function BuildingOverviewPage() {
  const { building, openAlarms } = await getBuildingData()

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#AEAEB2] text-sm">Building not found</p>
      </div>
    )
  }

  const totalZones = building.zones.length
  const totalSensors = building.zones.reduce((a, z) => a + z.sensors.length, 0)
  const totalEnergy = building.meters.reduce((a, m) => a + m.value, 0).toFixed(1)

  // Flatten zones into table rows
  const zoneRows: ZoneRow[] = building.zones.map((zone: any) => {
    const tempSensor = zone.sensors.find((s: any) => s.type === 'TEMPERATURE')
    const hvac = zone.hvacUnits[0]
    const light = zone.lightZones[0]
    const doorCount = zone.doors.length
    const unlockedCount = zone.doors.filter((d: any) => d.state === 'UNLOCKED').length

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

  const columns: Column<ZoneRow>[] = [
    { header: 'Zone', cell: (z) => <span className="text-[14px] font-medium text-white">{z.zoneName}</span> },
    { header: 'Type', cell: (z) => <span className="text-[12px] text-[#8E8E93] uppercase">{z.zoneType}</span> },
    { header: 'Area', cell: (z) => <span className="text-[12px] text-[#8E8E93]">{z.area ? `${z.area} m²` : '—'}</span> },
    { header: 'Temp', cell: (z) => <span className="text-[14px] font-['JetBrains_Mono'] text-white">{z.temp}</span> },
    { header: 'HVAC', cell: (z) => {
      const on = z.hvacState === 'ON'
      return <span className={`text-[12px] ${on ? 'text-[#32D74B]' : 'text-[#6B7280]'}`}>{z.hvacMode}</span>
    }},
    { header: 'Light', cell: (z) => {
      const has = z.dimLevel !== null
      return <span className={`text-[12px] ${has ? 'text-[#0A84FF]' : 'text-[#6B7280]'}`}>{z.dimLevel !== null ? `${z.dimLevel}%` : '—'}</span>
    }},
    { header: 'Doors', cell: (z) => <span className="text-[12px] text-[#AEAEB2]">{z.doors}</span> },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]">
          Building Overview
        </h1>
        <p className="text-[14px] font-medium text-[#8E8E93] mt-1">Biomedical Campus</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{totalZones}</p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Zones</p>
        </div>
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{totalSensors}</p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Sensors</p>
        </div>
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{openAlarms}</p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Open Alarms</p>
        </div>
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{totalEnergy}</p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Energy kW</p>
        </div>
      </div>

      {/* Zone Table */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={zoneRows}
          keyExtractor={(z) => z.id}
          emptyMessage="No zones found"
        />
      </div>
    </div>
  )
}
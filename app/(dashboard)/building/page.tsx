import { prisma } from '@/lib/prisma'
import { stripTowerPrefix } from '@/lib/zone-group'
import { DataTable, type Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { MetricValue } from '@/components/ui/metric-value'
import { EmptyState } from '@/components/ui/empty-state'

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

const columns: Column[] = [
  { header: 'Zone' },
  { header: 'Type' },
  { header: 'Area' },
  { header: 'Temp' },
  { header: 'HVAC' },
  { header: 'Light' },
  { header: 'Doors' },
]

export default async function BuildingOverviewPage() {
  const { building, openAlarms } = await getBuildingData()

  if (!building) return <EmptyState message="Building not found" />

  const totalZones = building.zones.length
  const totalSensors = building.zones.reduce((a: number, z: any) => a + z.sensors.length, 0)
  const totalEnergy = building.meters.reduce((a: number, m: any) => a + m.value, 0).toFixed(1)

  // Flatten zones into table rows
  const rows = building.zones.map((zone: any) => {
    const tempSensor = zone.sensors.find((s: any) => s.type === 'TEMPERATURE')
    const hvac = zone.hvacUnits[0]
    const light = zone.lightZones[0]
    const doorCount = zone.doors.length
    const unlockedCount = zone.doors.filter((d: any) => d.state === 'UNLOCKED').length

    return {
      id: zone.id,
      cells: [
        <span key="n" className="text-[14px] font-medium text-white">{stripTowerPrefix(zone.name)}</span>,
        <span key="t" className="text-[12px] text-[#8E8E93] uppercase">{zone.type}</span>,
        <span key="a" className="text-[12px] text-[#8E8E93]">{zone.area ? `${zone.area} m²` : '—'}</span>,
        <span key="tmp" className="text-[14px] font-['JetBrains_Mono'] text-white">
          {tempSensor ? `${tempSensor.value.toFixed(1)}${tempSensor.unit}` : '--'}
        </span>,
        (() => {
          const on = hvac?.state === 'ON'
          return <span key="h" className={`text-[12px] ${on ? 'text-[#32D74B]' : 'text-[#6B7280]'}`}>{hvac?.mode ?? 'AUTO'}</span>
        })(),
        (() => {
          const has = light?.dimLevel !== null
          return <span key="l" className={`text-[12px] ${has ? 'text-[#0A84FF]' : 'text-[#6B7280]'}`}>{light?.dimLevel !== null ? `${light.dimLevel}%` : '—'}</span>
        })(),
        <span key="d" className="text-[12px] text-[#AEAEB2]">
          {doorCount > 0 ? `${doorCount} (${unlockedCount} open)` : '—'}
        </span>,
      ],
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Building Overview" subtitle="Biomedical Campus" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricValue value={totalZones} label="Zones" />
        <MetricValue value={totalSensors} label="Sensors" />
        <MetricValue value={openAlarms} label="Open Alarms" />
        <MetricValue value={totalEnergy} label="Energy kW" />
      </div>

      {/* Zone Table */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rows}
          emptyMessage="No zones found"
        />
      </div>
    </div>
  )
}

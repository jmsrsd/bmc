import { prisma } from '@/lib/prisma'
import { buildZoneRows, calculateSummary } from './_helpers'
import { BuildingOverviewTable } from './_table'

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

export default async function BuildingOverviewPage() {
  const { building, openAlarms } = await getBuildingData()

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-body text-sm">Building not found</p>
      </div>
    )
  }

  const { totalZones, totalSensors, totalEnergy } = calculateSummary(building, openAlarms)
  const zoneRows = buildZoneRows(building)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]">
          Building Overview
        </h1>
        <p className="text-[14px] font-medium text-secondary mt-1">Biomedical Campus</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface/50 border border-hairline rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{totalZones}</p>
          <p className="text-body text-xs mt-1.5">Zones</p>
        </div>
        <div className="bg-surface/50 border border-hairline rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{totalSensors}</p>
          <p className="text-body text-xs mt-1.5">Sensors</p>
        </div>
        <div className="bg-surface/50 border border-hairline rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{openAlarms}</p>
          <p className="text-body text-xs mt-1.5">Open Alarms</p>
        </div>
        <div className="bg-surface/50 border border-hairline rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white">{totalEnergy}</p>
          <p className="text-body text-xs mt-1.5">Energy kW</p>
        </div>
      </div>

      {/* Zone Table */}
      <div className="mt-6">
        <BuildingOverviewTable rows={zoneRows} />
      </div>
    </div>
  )
}
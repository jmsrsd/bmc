import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { LightingControls } from './lighting-controls'
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

export default async function LightingPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: { lightZones: true },
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

  const rows = buildLightingRows(building)

  const columns: Column<any>[] = [
    { header: 'Zone', cell: (z) => <span className="text-[14px] font-medium text-white">{z.zoneName}</span> },
    { header: 'Floor', cell: (z) => <span className="text-[12px] text-secondary">{z.floor >= 0 ? `F${z.floor}` : `B${Math.abs(z.floor)}`}</span> },
    { header: 'Scene', cell: (z) => <span className="text-[12px] text-body">{z.scene}</span> },
    { header: 'Controls', cell: (z) => <LightingControls zoneId={z.id} initialDim={z.dimLevel} initialState={z.state} /> },
  ]

  return (
    <div>
      <PageHeader title="Lighting Control" subtitle="Zone dimming & scene control" />
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
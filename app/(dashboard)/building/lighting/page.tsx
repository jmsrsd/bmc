import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { LightingControls } from './lighting-controls'
import { stripTowerPrefix } from '@/lib/zone-group'
import { EmptyState } from '@/components/ui/empty-state'

export default async function LightingPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: { lightZones: true },
      },
    },
  })

  if (!building) return <EmptyState message="Building not found" />

  const columns: Column[] = [
    { header: 'Zone' },
    { header: 'Floor' },
    { header: 'Scene' },
    { header: 'Controls' },
  ]

  const rows = building.zones.map((zone: any) => {
    const light = zone.lightZones[0]
    return {
      id: zone.id,
      cells: [
        <span key="n" className="text-[14px] font-medium text-white">{stripTowerPrefix(zone.name)}</span>,
        <span key="f" className="text-[12px] text-[#8E8E93]">{zone.floor >= 0 ? `F${zone.floor}` : `B${Math.abs(zone.floor)}`}</span>,
        <span key="s" className="text-[12px] text-[#AEAEB2]">{light?.scene ?? 'NORMAL'}</span>,
        <LightingControls key="c" zoneId={zone.id} initialDim={light?.dimLevel ?? 0} initialState={light?.state ?? 'OFF'} />,
      ],
    }
  })

  return (
    <div>
      <PageHeader title="Lighting Control" subtitle="Zone dimming & scene control" />
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

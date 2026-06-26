import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { DoorLockButton } from './door-lock-button'
import { DOOR_STATE_COLORS, DOOR_STATE_LABELS } from '@/lib/ui-tokens/status'

const columns: Column[] = [
  { header: 'Zone', className: 'w-40' },
  { header: 'Door' },
  { header: 'Status', className: 'w-36' },
  { header: '', className: 'w-32 text-right' },
]

export default async function SecurityPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          doors: true,
        },
      },
    },
  })

  if (!building) return <EmptyState message="Building not found" />

  const rows = building.zones
    .filter((z: any) => z.doors.length > 0)
    .flatMap((zone: any) =>
      zone.doors.map((door: any) => ({
        id: door.id,
        cells: [
          <span key="z" className="text-[12px] text-[#8E8E93]">{zone.name}</span>,
          <span key="n" className="text-[14px] font-medium text-white">{door.name}</span>,
          <div key="s" className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: DOOR_STATE_COLORS[door.state] ?? '#6B7280' }}
            />
            <span className="text-[13px] text-[#8E8E93]">{DOOR_STATE_LABELS[door.state] ?? door.state}</span>
          </div>,
          <div key="b" className="flex justify-end">
            <DoorLockButton
              doorId={door.id}
              currentState={door.state}
              doorName={door.name}
            />
          </div>,
        ],
      })),
    )

  return (
    <div>
      <PageHeader title="Access Control" subtitle="Door lock/unlock status" />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rows}
          emptyMessage="No doors found"
        />
      </div>
    </div>
  )
}
